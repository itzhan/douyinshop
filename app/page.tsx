"use client";

import { useEffect, useMemo, useState } from "react";
import { Button, Card, Chip, Input, Spinner } from "@heroui/react";
import { Copy, X } from "lucide-react";

import type { Color, ImageAsset, PhoneModel, ProductWithRelations } from "@/lib/queries";

const numberOrNull = (v: string) => (v ? Number(v) : null);

export default function AdminPage() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"product" | "models" | "colors" | "images" | "list">("product");
  const [models, setModels] = useState<PhoneModel[]>([]);
  const [colors, setColors] = useState<Color[]>([]);
  const [images, setImages] = useState<ImageAsset[]>([]);
  const [products, setProducts] = useState<ProductWithRelations[]>([]);
  const [customBrands, setCustomBrands] = useState<string[]>([]);

  const [productForm, setProductForm] = useState({
    title: "",
    shop_name: "",
    price: "",
    model_id: "",
    color_id: "",
    paid_amount: "",
    order_number: "",
    cover_image_id: "",
  });

  const [modelForm, setModelForm] = useState({ name: "", brand: "" });
  const [brandDraft, setBrandDraft] = useState("");
  const [brandFilter, setBrandFilter] = useState("");
  const [colorForm, setColorForm] = useState({ name: "", hex: "" });
  const [imageForm, setImageForm] = useState({ model_id: "", color_id: "" });
  const [newShareLink, setNewShareLink] = useState<string>("");
  const [toast, setToast] = useState<{ text: string; type?: "success" | "error" | "info" } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<{ id: string; url: string; name: string }[]>([]);
  const [imageEdits, setImageEdits] = useState<Record<number, { model_id: string; color_id: string }>>({});
  const [editingImageId, setEditingImageId] = useState<number | null>(null);

  const filteredImages = useMemo(() => {
    return images.filter((img) => {
      if (productForm.model_id && img.model_id !== Number(productForm.model_id)) return false;
      if (productForm.color_id && img.color_id !== Number(productForm.color_id)) return false;
      return true;
    });
  }, [images, productForm.color_id, productForm.model_id]);

  const lightInputClassName =
    "w-full px-3 py-2 bg-white text-gray-900 placeholder:text-gray-400 border border-gray-300 rounded-lg shadow-sm " +
    "outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-100 focus-visible:border-primary-300 " +
    "focus-visible:shadow-[0_0_0_2px_rgba(59,130,246,0.08)] dark:bg-white dark:text-gray-900";
  const lightBoxClassName = "border border-gray-300 rounded-lg bg-white shadow-sm";

  const brandOptions = useMemo(() => {
    const set = new Set<string>();
    customBrands.forEach((b) => set.add(b));
    models.forEach((m) => m.brand && set.add(m.brand));
    return Array.from(set).sort();
  }, [customBrands, models]);

  const selectedCover = useMemo(
    () => images.find((img) => img.id === Number(productForm.cover_image_id)) ?? null,
    [images, productForm.cover_image_id]
  );

  const modelMap = useMemo(() => {
    const obj: Record<number, string> = {};
    models.forEach((m) => {
      obj[m.id] = m.name;
    });
    return obj;
  }, [models]);

  const colorMap = useMemo(() => {
    const obj: Record<number, string> = {};
    colors.forEach((c) => {
      obj[c.id] = c.name;
    });
    return obj;
  }, [colors]);

  const showToast = (text: string, type: "success" | "error" | "info" = "info") => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 2200);
  };

  const loadBaseData = async () => {
    setLoading(true);
    try {
      const [mRes, cRes, iRes, pRes] = await Promise.all([
        fetch("/api/models").then((r) => r.json()),
        fetch("/api/colors").then((r) => r.json()),
        fetch("/api/images").then((r) => r.json()),
        fetch("/api/products").then((r) => r.json()),
      ]);
      setModels(mRes.data ?? []);
      setColors(cRes.data ?? []);
      setImages(iRes.data ?? []);
      setProducts(pRes.data ?? []);
      setCustomBrands((prev) => {
        const merged = new Set(prev);
        (mRes.data ?? []).forEach((m: PhoneModel) => m.brand && merged.add(m.brand));
        return Array.from(merged);
      });
    } catch (error) {
      showToast(`加载数据失败: ${error}`, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBaseData();
  }, []);

  const handleCreateProduct = async () => {
    setToast(null);
    const autoImages =
      productForm.model_id && productForm.color_id ? filteredImages.map((img) => img.id) : [];
    const payload = {
      title: productForm.title,
      price: Number(productForm.price),
      shop_name: productForm.shop_name || null,
      model_id: numberOrNull(productForm.model_id),
      color_id: numberOrNull(productForm.color_id),
      paid_amount: numberOrNull(productForm.paid_amount),
      order_number: productForm.order_number || null,
      cover_image_id: numberOrNull(productForm.cover_image_id),
      image_ids: autoImages,
    };
    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok) {
      showToast(json.error || "创建失败", "error");
      return;
    }
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const link = `${origin}/p/${json.data.share_token}`;
    setNewShareLink(link);
    showToast("商品创建成功", "success");
    setProductForm({
      title: "",
      shop_name: "",
      price: "",
      model_id: "",
      color_id: "",
      paid_amount: "",
      order_number: "",
      cover_image_id: "",
    });
    loadBaseData();
  };

  const handleCreateModel = async () => {
    const brandName = modelForm.brand;
    const res = await fetch("/api/models", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(modelForm),
    });
    const json = await res.json();
    if (!res.ok) return showToast(json.error || "新增型号失败", "error");
    setModelForm({ name: "", brand: "" });
    setCustomBrands((prev) => {
      const merged = new Set(prev);
      if (brandName) merged.add(brandName);
      return Array.from(merged);
    });
    showToast("型号已保存", "success");
    loadBaseData();
  };

  const handleCreateColor = async () => {
    const res = await fetch("/api/colors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(colorForm),
    });
    const json = await res.json();
    if (!res.ok) return showToast(json.error || "新增颜色失败", "error");
    setColorForm({ name: "", hex: "" });
    showToast("颜色已保存", "success");
    loadBaseData();
  };

  const handleCreateImages = async () => {
    if (!pendingFiles.length) {
      showToast("请先选择并上传文件", "error");
      return;
    }
    if (!imageForm.model_id || !imageForm.color_id) {
      showToast("请选择要绑定的型号和颜色", "error");
      return;
    }
    setUploading(true);
    try {
      const urls = pendingFiles.map((p) => p.url);
      const res = await fetch("/api/images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          urls,
          model_id: numberOrNull(imageForm.model_id),
          color_id: numberOrNull(imageForm.color_id),
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "入库失败");
      showToast("图片已入库并绑定", "success");
      setPendingFiles([]);
      loadBaseData();
    } catch (error) {
      showToast(String(error), "error");
    } finally {
      setUploading(false);
    }
  };

  const handleAddBrand = () => {
    const name = brandDraft.trim();
    if (!name) return;
    setCustomBrands((prev) => Array.from(new Set([...prev, name])));
    setBrandDraft("");
    showToast("品牌已添加", "success");
  };

  const handleUpdateImage = async (id: number, next?: { model_id?: string; color_id?: string }) => {
    try {
      setToast(null);
      const fallback = images.find((i) => i.id === id);
      const draft = next ?? imageEdits[id];
      const modelId = draft?.model_id ?? fallback?.model_id?.toString() ?? "";
      const colorId = draft?.color_id ?? fallback?.color_id?.toString() ?? "";
      const res = await fetch(`/api/images/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model_id: modelId ? Number(modelId) : null,
          color_id: colorId ? Number(colorId) : null,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "更新失败");
      showToast("图片已更新", "success");
      setImageEdits((prev) => {
        const draftNext = { ...prev };
        delete draftNext[id];
        return draftNext;
      });
      await loadBaseData();
    } catch (error) {
      showToast(String(error), "error");
    }
  };

  const handleDeleteImage = async (id: number) => {
    if (!window.confirm("确认删除这张图片吗？此操作不可恢复")) return;
    try {
      setToast(null);
      const res = await fetch(`/api/images/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "删除失败");
      showToast("图片已删除", "success");
      await loadBaseData();
    } catch (error) {
      showToast(String(error), "error");
    }
  };

  const copyLink = async (link: string) => {
    try {
      if (!navigator?.clipboard) throw new Error("当前环境不支持一键复制");
      await navigator.clipboard.writeText(link);
      showToast("复制成功", "success");
    } catch (error) {
      showToast(typeof error === "string" ? error : "复制失败，请检查浏览器权限", "error");
    }
  };

  const handleDeleteModel = async (id: number) => {
    if (!window.confirm("确认删除该型号吗？相关商品与图片的绑定将失效")) return;
    try {
      setToast(null);
      const res = await fetch(`/api/models/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "删除型号失败");
      showToast("型号已删除", "success");
      await loadBaseData();
    } catch (error) {
      showToast(String(error), "error");
    }
  };

  const handleDeleteColor = async (id: number) => {
    if (!window.confirm("确认删除该颜色吗？相关商品与图片的绑定将失效")) return;
    try {
      setToast(null);
      const res = await fetch(`/api/colors/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "删除颜色失败");
      showToast("颜色已删除", "success");
      await loadBaseData();
    } catch (error) {
      showToast(String(error), "error");
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm("确认删除该商品吗？删除后分享链接将失效")) return;
    try {
      setToast(null);
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "删除商品失败");
      showToast("商品已删除", "success");
      await loadBaseData();
    } catch (error) {
      showToast(String(error), "error");
    }
  };

  const latestShareLink = useMemo(() => {
    if (!products.length) return "";
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    return `${origin}/p/${products[0].share_token}`;
  }, [products]);

  const renderNav = () => (
    <div className="flex flex-wrap gap-2">
      {(
        [
          { key: "product", label: "商品上架" },
          { key: "models", label: "型号管理" },
          { key: "colors", label: "颜色管理" },
          { key: "images", label: "图片管理" },
          { key: "list", label: "已上架商品" },
        ] as const
      ).map((item) => (
        <Button
          key={item.key}
          size="sm"
          variant={activeTab === item.key ? "primary" : "ghost"}
          onPress={() => setActiveTab(item.key)}
        >
          {item.label}
        </Button>
      ))}
    </div>
  );

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white text-gray-900 p-6 space-y-6">
      <div className="mx-auto max-w-6xl space-y-6">

        {toast && (
          <div
            className={`fixed right-4 top-6 z-50 min-w-[240px] max-w-sm rounded-lg px-4 py-3 text-sm shadow-lg ${
              toast.type === "error"
                ? "bg-red-50 text-red-700 border border-red-200"
                : toast.type === "success"
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-gray-900 text-white border border-gray-800"
            }`}
          >
            {toast.text}
          </div>
        )}

        {renderNav()}

        {/* 商品上架 */}
        {activeTab === "product" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* 左侧：型号与颜色选择 */}
            <Card className="p-5 lg:col-span-3 space-y-4">
              <div className="text-base font-semibold">型号与颜色</div>

              <div className="space-y-1">
                <label className="text-sm text-gray-600">手机型号</label>
                <select
                  className={`${lightInputClassName} text-sm`}
                  value={productForm.model_id}
                  onChange={(e) =>
                    setProductForm({
                      ...productForm,
                      model_id: e.target.value,
                      cover_image_id: "",
                    })
                  }
                >
                  <option value="">选择型号</option>
                  {models.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} {m.brand ? `(${m.brand})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-gray-600">颜色</label>
                <div className="flex flex-wrap gap-2">
                  {colors.map((c) => {
                    const active = productForm.color_id === String(c.id);
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() =>
                          setProductForm({
                            ...productForm,
                            color_id: String(c.id),
                            cover_image_id: "",
                          })
                        }
                        className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-sm transition-all ${
                          active
                            ? "border-transparent bg-gray-900 text-white shadow-md"
                            : "border-default-200 bg-white text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        <span
                          aria-hidden
                          className={`inline-flex w-3.5 h-3.5 rounded-full ${active ? "ring-2 ring-white/50" : "border border-black/10"}`}
                          style={{ background: c.hex ?? "#e5e7eb" }}
                        />
                        <span>{c.name}</span>
                      </button>
                    );
                  })}
                  {!colors.length && <span className="text-xs text-gray-400">请先去颜色管理新增</span>}
                </div>
              </div>

              {(!productForm.model_id || !productForm.color_id) && (
                <div className="text-xs text-amber-600 bg-amber-50 rounded-lg p-2">
                  请先选择型号和颜色，才能选择封面图片
                </div>
              )}
            </Card>

            {/* 中间：封面选择 */}
            <Card className="p-5 lg:col-span-5 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div className="text-base font-semibold">选择封面</div>
                <span className="text-xs text-gray-400">自动按型号/颜色筛选</span>
              </div>

              {/* 候选图片 */}
              {productForm.model_id && productForm.color_id ? (
                filteredImages.length ? (
                  <div className="flex-1 overflow-y-auto min-h-0 px-4 py-4">
                    <div className="grid grid-cols-3 gap-4">
                      {filteredImages.map((img) => {
                        const active = productForm.cover_image_id === String(img.id);
                        return (
                          <button
                            key={img.id}
                            type="button"
                            onClick={() => setProductForm({ ...productForm, cover_image_id: String(img.id) })}
                            className={`relative aspect-square rounded-lg overflow-hidden transition-all ${
                              active
                                ? "ring-2 ring-primary-400 ring-offset-1 shadow-sm"
                                : "border border-default-200 hover:shadow-sm hover:scale-[1.01]"
                            }`}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={img.url} alt="封面候选" className="w-full h-full object-cover" />
                            {active && (
                              <span className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-gray-900 flex items-center justify-center">
                                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center rounded-lg border border-dashed border-default-300 bg-default-50">
                    <p className="text-sm text-gray-400">该型号与颜色暂无图片，请先到图片管理导入</p>
                  </div>
                )
              ) : (
                <div className="flex-1 flex items-center justify-center rounded-lg border border-dashed border-default-300 bg-default-50">
                  <p className="text-sm text-gray-400">请先在左侧选择型号和颜色</p>
                </div>
              )}
            </Card>

            {/* 右侧：商品信息与提交 */}
            <Card className="p-5 lg:col-span-4 space-y-4 bg-white text-gray-900 dark:bg-white dark:text-gray-900">
              <div className="text-base font-semibold">商品信息</div>

              <div className="space-y-1">
                <label htmlFor="product-title" className="text-sm text-gray-600">
                  商品标题 <span className="text-red-500">*</span>
                </label>
                <Input
                  id="product-title"
                  placeholder="例如：森林科技批发 - iPhone16"
                  value={productForm.title}
                  className={lightInputClassName}
                  onChange={(e) => setProductForm({ ...productForm, title: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="shop-name" className="text-sm text-gray-600">
                  店铺名（可自定义）
                </label>
                <Input
                  id="shop-name"
                  placeholder="例如：森林科技旗舰店"
                  value={productForm.shop_name}
                  className={lightInputClassName}
                  onChange={(e) => setProductForm({ ...productForm, shop_name: e.target.value })}
                />
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label htmlFor="product-price" className="text-sm text-gray-600">
                    售价 <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-3 flex items-center text-sm text-gray-500">¥</span>
                    <Input
                      id="product-price"
                      type="number"
                      className={`pl-7 ${lightInputClassName}`}
                      placeholder="0.00"
                      value={productForm.price}
                      onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label htmlFor="product-paid" className="text-sm text-gray-600">
                    实付款
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-3 flex items-center text-sm text-gray-500">¥</span>
                    <Input
                      id="product-paid"
                      type="number"
                      className={`pl-7 ${lightInputClassName}`}
                      placeholder="0.00"
                      value={productForm.paid_amount}
                      onChange={(e) => setProductForm({ ...productForm, paid_amount: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor="product-order" className="text-sm text-gray-600">
                  订单编号
                </label>
                <Input
                  id="product-order"
                  placeholder="可选"
                  value={productForm.order_number}
                  className={lightInputClassName}
                  onChange={(e) => setProductForm({ ...productForm, order_number: e.target.value })}
                />
              </div>

              <div className="border-t pt-4 space-y-3">
                <Button
                  variant="primary"
                  className="w-full"
                  size="lg"
                  onPress={handleCreateProduct}
                  isDisabled={loading || !productForm.title || !productForm.price || !productForm.cover_image_id}
                >
                  生成商品并获得分享链接
                </Button>

                {(!productForm.title || !productForm.price || !productForm.cover_image_id) && (
                  <p className="text-xs text-gray-400 text-center">
                    请完成以上必填项（标题、售价、封面）
                  </p>
                )}
              </div>

              {newShareLink && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 space-y-2">
                  <div className="text-sm font-medium text-green-700">商品创建成功</div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm truncate flex-1 text-green-600">{newShareLink}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="flex items-center gap-1 shrink-0"
                      onPress={() => void copyLink(newShareLink)}
                    >
                      <Copy className="w-4 h-4" />
                      复制
                    </Button>
                  </div>
                </div>
              )}

              {/* 最新商品链接 */}
              {!newShareLink && latestShareLink && (
                <div className="bg-default-50 border border-default-200 rounded-lg p-3 space-y-2">
                  <div className="text-xs text-gray-500">最近上架商品链接：</div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm truncate flex-1">{latestShareLink}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="flex items-center gap-1 shrink-0"
                      onPress={() => void copyLink(latestShareLink)}
                    >
                      <Copy className="w-4 h-4" />
                      复制
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </div>
        )}

        {/* 型号管理 */}
        {activeTab === "models" && (
          <div className="space-y-4">
            <Card className="p-4 space-y-3">
              <div className="text-base font-semibold">品牌管理</div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                <div className="md:col-span-2 space-y-1">
                  <label htmlFor="brand-name" className="text-sm text-gray-600">
                    新增品牌
                  </label>
                  <Input
                    id="brand-name"
                    placeholder="如 Apple / Huawei"
                    value={brandDraft}
                    className={lightInputClassName}
                    onChange={(e) => setBrandDraft(e.target.value)}
                  />
                </div>
                <Button variant="primary" isDisabled={!brandDraft.trim()} onPress={handleAddBrand}>
                  添加品牌
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {brandOptions.map((b) => (
                  <Chip key={b} color="default" variant="soft">
                    {b}
                  </Chip>
                ))}
                {!brandOptions.length && <span className="text-xs text-gray-400">暂无品牌，先添加一个吧</span>}
              </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card className="p-4 space-y-3">
                <div className="text-base font-semibold">新增型号</div>
                <div className="space-y-1">
                  <label className="text-sm text-gray-600">品牌</label>
                <select
                  className={`${lightInputClassName} text-sm`}
                  value={modelForm.brand}
                  onChange={(e) => setModelForm({ ...modelForm, brand: e.target.value })}
                >
                  <option value="">先选择或新增品牌</option>
                    {brandOptions.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label htmlFor="model-name" className="text-sm text-gray-600">
                    型号名称
                  </label>
                  <Input
                    id="model-name"
                    placeholder="iPhone 16"
                    value={modelForm.name}
                    className={lightInputClassName}
                    onChange={(e) => setModelForm({ ...modelForm, name: e.target.value })}
                  />
                </div>
                <Button variant="primary" isDisabled={!modelForm.name} onPress={handleCreateModel}>
                  保存型号
                </Button>
              </Card>

              <Card className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-base font-semibold">已有型号</div>
                  <div className="flex gap-2 flex-wrap text-xs">
                    <button
                      type="button"
                      onClick={() => setBrandFilter("")}
                      className={`px-2 py-1 rounded-full border ${brandFilter === "" ? "border-primary-500 text-primary-700" : "border-default-200 text-gray-500"}`}
                    >
                      全部
                    </button>
                    <button
                      type="button"
                      onClick={() => setBrandFilter("none")}
                      className={`px-2 py-1 rounded-full border ${brandFilter === "none" ? "border-primary-500 text-primary-700" : "border-default-200 text-gray-500"}`}
                    >
                      未分品牌
                    </button>
                    {brandOptions.map((b) => (
                      <button
                        key={b}
                        type="button"
                        onClick={() => setBrandFilter(b)}
                        className={`px-2 py-1 rounded-full border ${
                          brandFilter === b ? "border-primary-500 text-primary-700" : "border-default-200 text-gray-500"
                        }`}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2 max-h-96 overflow-auto text-sm">
                  {(() => {
                    const filtered = models.filter((m) => {
                      if (brandFilter === "none") return !m.brand;
                      if (brandFilter) return m.brand === brandFilter;
                      return true;
                    });
                    if (!filtered.length) {
                      return <p className="text-xs text-gray-400">当前筛选下暂无型号</p>;
                    }
                    return filtered.map((m) => (
                      <div key={m.id} className={`${lightBoxClassName} flex items-center justify-between px-3 py-2 gap-2`}>
                        <div className="flex flex-col">
                          <div className="font-medium">{m.name}</div>
                          <span className="text-gray-400 text-xs">{m.brand ?? "未设置品牌"}</span>
                        </div>
                        <button
                          type="button"
                          className="text-danger text-xs hover:underline"
                          onClick={() => void handleDeleteModel(m.id)}
                        >
                          删除
                        </button>
                      </div>
                    ));
                  })()}
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* 颜色管理 */}
        {activeTab === "colors" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="p-4 space-y-3">
              <div className="text-base font-semibold">新增颜色</div>
              <div className="space-y-1">
                <label htmlFor="color-name" className="text-sm text-gray-600">
                  颜色名称
                </label>
                <Input
                  id="color-name"
                  placeholder="远峰蓝"
                  value={colorForm.name}
                  className={lightInputClassName}
                  onChange={(e) => setColorForm({ ...colorForm, name: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="color-hex" className="text-sm text-gray-600">
                  色值 (可选)
                </label>
                <Input
                  id="color-hex"
                  placeholder="#6c8ebf"
                  value={colorForm.hex}
                  className={lightInputClassName}
                  onChange={(e) => setColorForm({ ...colorForm, hex: e.target.value })}
                />
              </div>
              <Button variant="primary" isDisabled={!colorForm.name} onPress={handleCreateColor}>
                保存颜色
              </Button>
            </Card>

            <Card className="p-4">
              <div className="text-base font-semibold mb-2">已有颜色</div>
              {colors.length ? (
                <div className="flex flex-wrap gap-2">
                  {colors.map((c) => (
                    <div key={c.id} className={`${lightBoxClassName} flex items-center gap-2 px-3 py-1 text-xs`}>
                      <span
                        aria-hidden
                        className="inline-flex w-3 h-3 rounded-full"
                        style={{ background: c.hex ?? "#ccc" }}
                      />
                      <span>{c.name}</span>
                      <button
                        type="button"
                        className="text-danger hover:underline"
                        onClick={() => void handleDeleteColor(c.id)}
                      >
                        删除
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400">暂无数据</p>
              )}
            </Card>
          </div>
        )}

        {/* 图片管理 */}
        {activeTab === "images" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="p-4 space-y-3 lg:col-span-1">
              <div className="text-base font-semibold">批量导入图片</div>
              <div className="space-y-2 rounded-lg border border-dashed border-default-300 bg-default-50 p-3">
                <div className="flex items-center justify-between text-sm font-medium text-gray-700">
                  <span>选择文件（先预览，确认后再入库）</span>
                  <span className="text-[11px] text-gray-400">支持多选</span>
                </div>
                <label className="flex cursor-pointer items-center justify-center gap-2 rounded-md border border-default-200 bg-white px-3 py-2 text-sm hover:border-primary-200">
                  <input
                    type="file"
                    className="hidden"
                    multiple
                    onChange={async (e) => {
                      const files = Array.from(e.target.files ?? []);
                      if (!files.length) return;
                      setUploading(true);
                      try {
                        const uploaded: { id: string; url: string; name: string }[] = [];
                        for (const f of files) {
                          const form = new FormData();
                          form.append("file", f);
                          const dirParts = [
                            imageForm.model_id ? `model-${imageForm.model_id}` : "",
                            imageForm.color_id ? `color-${imageForm.color_id}` : "",
                          ].filter(Boolean);
                          if (dirParts.length) form.append("dir", dirParts.join("/"));
                          const res = await fetch("/api/upload/cos", { method: "POST", body: form });
                          const json = await res.json();
                          if (!res.ok) throw new Error(json.error || "上传失败");
                          uploaded.push({ id: crypto.randomUUID(), url: json.url, name: f.name });
                        }
                        setPendingFiles((prev) => [...prev, ...uploaded]);
                        showToast(`已上传 ${uploaded.length} 个文件，待绑定`, "success");
                      } catch (error) {
                        showToast(String(error), "error");
                      } finally {
                        setUploading(false);
                        e.target.value = "";
                      }
                    }}
                  />
                  <span className="text-primary-600 font-medium">{uploading ? "上传中..." : "选择文件"}</span>
                </label>
                {!!pendingFiles.length && (
                  <div className="grid grid-cols-2 gap-2">
                    {pendingFiles.map((f) => (
                      <div key={f.id} className="relative border rounded-md overflow-hidden bg-white">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={f.url} alt={f.name} className="w-full h-24 object-cover" />
                        <button
                          type="button"
                          className="absolute top-1 right-1 rounded-full bg-black/60 text-white text-[10px] px-2 py-0.5"
                          onClick={() =>
                            setPendingFiles((prev) => prev.filter((p) => p.id !== f.id))
                          }
                        >
                          删除
                        </button>
                        <div className="px-2 py-1 text-[11px] text-gray-600 line-clamp-1">{f.name}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="space-y-1">
                <label className="text-sm text-gray-600">绑定型号</label>
                <select
                  className={`${lightInputClassName} text-sm`}
                  value={imageForm.model_id}
                  onChange={(e) => setImageForm({ ...imageForm, model_id: e.target.value })}
                >
                  <option value="">请选择</option>
                  {models.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm text-gray-600">绑定颜色</label>
                <select
                  className={`${lightInputClassName} text-sm`}
                  value={imageForm.color_id}
                  onChange={(e) => setImageForm({ ...imageForm, color_id: e.target.value })}
                >
                  <option value="">请选择</option>
                  {colors.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <Button variant="primary" isDisabled={uploading || !pendingFiles.length} onPress={handleCreateImages}>
                {uploading ? "正在导入..." : "导入并绑定"}
              </Button>
            </Card>

            <Card className="p-4 lg:col-span-2 flex flex-col h-[640px]">
              <div className="text-base font-semibold mb-3 flex-shrink-0">图片库</div>
              {loading ? (
                <div className="flex-1 flex items-center gap-2 text-sm text-gray-500">
                  <Spinner size="sm" /> 加载中
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto pr-1">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {images.map((img) => {
                      const edit = imageEdits[img.id] ?? {
                        model_id: img.model_id?.toString() ?? "",
                        color_id: img.color_id?.toString() ?? "",
                      };
                      return (
                        <div key={img.id} className={`${lightBoxClassName} relative overflow-hidden flex flex-col`}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={img.url} alt="图片" className="w-full h-40 object-cover" />
                          <button
                            type="button"
                            className="absolute top-1.5 right-1.5 inline-flex items-center justify-center rounded-full bg-black/60 text-white p-1"
                            onClick={() => void handleDeleteImage(img.id)}
                            aria-label="删除图片"
                          >
                            <X className="w-3 h-3" />
                          </button>
                          <div className="p-2 text-xs text-gray-700 space-y-2 flex-1">
                            <div className="flex items-center justify-between gap-1">
                              <div className="flex flex-wrap gap-1.5">
                                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-gray-700">
                                  {modelMap[img.model_id ?? -1] ?? "未绑定型号"}
                                </span>
                                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-gray-700">
                                  {colorMap[img.color_id ?? -1] ?? "未绑定颜色"}
                                </span>
                              </div>
                              {editingImageId === img.id ? (
                                <button
                                  type="button"
                                  className="text-primary-600 hover:underline"
                                  onClick={() => setEditingImageId(null)}
                                >
                                  完成
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  className="text-primary-600 hover:underline"
                                  onClick={() => setEditingImageId(img.id)}
                                >
                                  编辑
                                </button>
                              )}
                            </div>

                            {editingImageId === img.id && (
                              <div className="space-y-1">
                                <select
                                  className={`${lightInputClassName} text-xs px-2 py-1`}
                                  value={edit.model_id}
                                  onChange={async (e) => {
                                    const value = e.target.value;
                                    setImageEdits((prev) => ({
                                      ...prev,
                                      [img.id]: { ...edit, model_id: value },
                                    }));
                                    await handleUpdateImage(img.id, { model_id: value, color_id: edit.color_id });
                                  }}
                                >
                                  <option value="">未绑定型号</option>
                                  {models.map((m) => (
                                    <option key={m.id} value={m.id}>
                                      {m.name}
                                    </option>
                                  ))}
                                </select>
                                <select
                                  className={`${lightInputClassName} text-xs px-2 py-1`}
                                  value={edit.color_id}
                                  onChange={async (e) => {
                                    const value = e.target.value;
                                    setImageEdits((prev) => ({
                                      ...prev,
                                      [img.id]: { ...edit, color_id: value },
                                    }));
                                    await handleUpdateImage(img.id, { model_id: edit.model_id, color_id: value });
                                  }}
                                >
                                  <option value="">未绑定颜色</option>
                                  {colors.map((c) => (
                                    <option key={c.id} value={c.id}>
                                      {c.name}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    {!images.length && <p className="text-xs text-gray-400">暂无图片</p>}
                  </div>
                </div>
              )}
            </Card>
          </div>
        )}

        {/* 已上架商品 */}
        {activeTab === "list" && (
          <Card className="p-4">
            <div className="text-base font-semibold mb-3">商品列表</div>
            {products.length === 0 ? (
              <p className="text-xs text-gray-400">暂无商品</p>
            ) : (
              <div className="divide-y text-sm">
                {products.map((item) => {
                  const origin = typeof window !== "undefined" ? window.location.origin : "";
                  const link = `${origin}/p/${item.share_token}`;
                  return (
                    <div key={item.id} className="py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                      <div className="space-y-1">
                        <div className="font-medium text-gray-900">{item.title}</div>
                        <div className="text-xs text-gray-500">型号：{item.model_name ?? "-"} ｜ 颜色：{item.color_name ?? "-"}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-primary font-semibold">¥ {Number(item.price).toFixed(2)}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="flex items-center gap-1"
                          onPress={() => void copyLink(link)}
                        >
                          <Copy className="w-4 h-4" />
                          复制链接
                        </Button>
                        <button
                          type="button"
                          className="text-danger text-xs hover:underline"
                          onClick={() => void handleDeleteProduct(item.id)}
                        >
                          删除
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        )}
      </div>
    </main>
  );
}
