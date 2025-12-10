"use client";

import { useEffect, useMemo, useState } from "react";
import { Button, Card, Chip, Input, Spinner, TextArea } from "@heroui/react";
import { Copy } from "lucide-react";

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
  const [imageForm, setImageForm] = useState({ urls: "", model_id: "", color_id: "" });
  const [newShareLink, setNewShareLink] = useState<string>("");
  const [message, setMessage] = useState<string>("");

  const filteredImages = useMemo(() => {
    return images.filter((img) => {
      if (productForm.model_id && img.model_id !== Number(productForm.model_id)) return false;
      if (productForm.color_id && img.color_id !== Number(productForm.color_id)) return false;
      return true;
    });
  }, [images, productForm.color_id, productForm.model_id]);

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
      setMessage(`加载数据失败: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBaseData();
  }, []);

  const handleCreateProduct = async () => {
    setMessage("");
    const autoImages =
      productForm.model_id && productForm.color_id ? filteredImages.map((img) => img.id) : [];
    const payload = {
      title: productForm.title,
      price: Number(productForm.price),
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
      setMessage(json.error || "创建失败");
      return;
    }
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const link = `${origin}/p/${json.data.share_token}`;
    setNewShareLink(link);
    setMessage("商品创建成功");
    setProductForm({
      title: "",
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
    if (!res.ok) return setMessage(json.error || "新增型号失败");
    setModelForm({ name: "", brand: "" });
    setCustomBrands((prev) => {
      const merged = new Set(prev);
      if (brandName) merged.add(brandName);
      return Array.from(merged);
    });
    loadBaseData();
  };

  const handleCreateColor = async () => {
    const res = await fetch("/api/colors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(colorForm),
    });
    const json = await res.json();
    if (!res.ok) return setMessage(json.error || "新增颜色失败");
    setColorForm({ name: "", hex: "" });
    loadBaseData();
  };

  const handleCreateImages = async () => {
    const urlList = imageForm.urls
      .split(/\n|,/)
      .map((s) => s.trim())
      .filter(Boolean);
    const res = await fetch("/api/images", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        urls: urlList,
        model_id: numberOrNull(imageForm.model_id),
        color_id: numberOrNull(imageForm.color_id),
      }),
    });
    const json = await res.json();
    if (!res.ok) return setMessage(json.error || "新增图片失败");
    setImageForm({ urls: "", model_id: "", color_id: "" });
    loadBaseData();
  };

  const handleAddBrand = () => {
    const name = brandDraft.trim();
    if (!name) return;
    setCustomBrands((prev) => Array.from(new Set([...prev, name])));
    setBrandDraft("");
  };

  const copyLink = (link: string) => {
    if (navigator?.clipboard) navigator.clipboard.writeText(link);
    setMessage("已复制链接");
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
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">后台管理（HeroUI + PostgreSQL）</h1>
            <p className="text-sm text-gray-500">商品上架 / 型号颜色 / 图片库 / 分享链接</p>
          </div>
          <div className="flex items-center gap-2">
            <Chip color="success" variant="soft">数据库：PostgreSQL</Chip>
            <Chip color="accent" variant="soft">Docker 部署</Chip>
          </div>
        </header>

        {message && (
          <Card className="border border-primary-200/60 p-3 text-sm text-primary-700">
            {message}
          </Card>
        )}

        {renderNav()}

        {/* 商品上架 */}
        {activeTab === "product" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="p-4 lg:col-span-2 space-y-4">
              <div className="text-base font-semibold">填写商品信息</div>
              <div className="space-y-1">
                <label htmlFor="product-title" className="text-sm text-gray-600">
                  商品标题
                </label>
                <Input
                  id="product-title"
                  placeholder="例如：森林科技批发 - iPhone16"
                  value={productForm.title}
                  onChange={(e) => setProductForm({ ...productForm, title: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label htmlFor="product-price" className="text-sm text-gray-600">
                    售价
                  </label>
                  <div className="relative">
                    <Input
                      id="product-price"
                      type="number"
                      className="pr-8"
                      value={productForm.price}
                      onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    />
                    <span className="absolute inset-y-0 right-3 flex items-center text-xs text-gray-500">¥</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <label htmlFor="product-paid" className="text-sm text-gray-600">
                    实付款
                  </label>
                  <div className="relative">
                    <Input
                      id="product-paid"
                      type="number"
                      className="pr-8"
                      value={productForm.paid_amount}
                      onChange={(e) => setProductForm({ ...productForm, paid_amount: e.target.value })}
                    />
                    <span className="absolute inset-y-0 right-3 flex items-center text-xs text-gray-500">¥</span>
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
                    onChange={(e) => setProductForm({ ...productForm, order_number: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-sm text-gray-600">手机型号</label>
                <select
                  className="w-full rounded-lg border border-default-200 px-3 py-2 text-sm bg-white"
                  value={productForm.model_id}
                  onChange={(e) =>
                    setProductForm({
                      ...productForm,
                      model_id: e.target.value,
                      cover_image_id: "",
                    })
                  }
                >
                    <option value="">选择或先去新增</option>
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
                          className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition ${
                            active ? "border-primary-500 bg-primary-50 text-primary-700 shadow-sm" : "border-default-200 bg-white hover:border-primary-200"
                          }`}
                        >
                          <span
                            aria-hidden
                            className="inline-flex w-4 h-4 rounded-full border border-black/5"
                            style={{ background: c.hex ?? "#e5e7eb" }}
                          />
                          <span>{c.name}</span>
                        </button>
                      );
                    })}
                    {!colors.length && <span className="text-xs text-gray-400">请先去颜色管理新增颜色</span>}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm text-gray-600">封面图片</label>
                  <span className="text-xs text-gray-400">先选型号+颜色后自动筛选</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="md:col-span-1">
                    <div className="aspect-video w-full rounded-lg border border-dashed border-default-300 bg-gradient-to-br from-slate-50 to-white flex items-center justify-center overflow-hidden">
                      {selectedCover ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={selectedCover.url} alt="已选封面" className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-xs text-gray-400 text-center leading-5 px-4">
                          封面占位图
                          <br />
                          选择型号与颜色后从右侧列表点击设置
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    {productForm.model_id && productForm.color_id ? (
                      filteredImages.length ? (
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                          {filteredImages.map((img) => {
                            const active = productForm.cover_image_id === String(img.id);
                            return (
                              <button
                                key={img.id}
                                type="button"
                                onClick={() => setProductForm({ ...productForm, cover_image_id: String(img.id) })}
                                className={`relative aspect-video rounded-lg overflow-hidden border transition ${
                                  active ? "border-primary-500 ring-2 ring-primary-200 shadow-sm" : "border-default-200 hover:border-primary-200"
                                }`}
                              >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={img.url} alt="封面候选" className="w-full h-full object-cover" />
                                <span className={`absolute left-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                                  active ? "bg-primary-600 text-white" : "bg-black/60 text-white"
                                }`}>
                                  #{img.id}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-xs text-gray-400">该型号与颜色暂未绑定图片，请先到图片管理导入。</p>
                      )
                    ) : (
                      <p className="text-xs text-gray-400">请先选择型号和颜色以自动筛选可用图片。</p>
                    )}
                  </div>
                </div>
              </div>

              <Button variant="primary" onPress={handleCreateProduct} isDisabled={loading || !productForm.title || !productForm.price}>
                生成商品并获得分享链接
              </Button>

              {newShareLink && (
                <div className="flex items-center gap-3 text-sm bg-primary-50 border border-primary-100 rounded-lg px-3 py-2">
                  <span className="truncate">{newShareLink}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="flex items-center gap-1"
                    onPress={() => copyLink(newShareLink)}
                  >
                    <Copy className="w-4 h-4" />
                    复制
                  </Button>
                </div>
              )}
            </Card>

            <Card className="p-4 space-y-3">
              <div className="text-base font-semibold">最新链接/提示</div>
              {loading ? (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Spinner size="sm" /> 加载中
                </div>
              ) : latestShareLink ? (
                <div className="flex items-center gap-3 text-sm bg-default-50 border border-default-200 rounded-lg px-3 py-2">
                  <span className="truncate">{latestShareLink}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="flex items-center gap-1"
                    onPress={() => copyLink(latestShareLink)}
                  >
                    <Copy className="w-4 h-4" />
                    复制
                  </Button>
                </div>
              ) : (
                <p className="text-xs text-gray-400">暂无商品</p>
              )}
              <div className="text-xs text-gray-500 leading-5 border-t pt-2">
                1) 先在“图片管理”导入多张图片并绑定型号/颜色；<br />
                2) 在“型号/颜色管理”先补充选项；<br />
                3) 选择型号与颜色后点选封面候选，填写价格即可生成分享链接。
              </div>
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
                    onChange={(e) => setBrandDraft(e.target.value)}
                  />
                </div>
                <Button variant="primary" isDisabled={!brandDraft.trim()} onPress={handleAddBrand}>
                  添加品牌
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {brandOptions.map((b) => (
                  <Chip key={b} color="default" variant="flat">
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
                  <label htmlFor="model-name" className="text-sm text-gray-600">
                    型号名称
                  </label>
                  <Input
                    id="model-name"
                    placeholder="iPhone 16"
                    value={modelForm.name}
                    onChange={(e) => setModelForm({ ...modelForm, name: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm text-gray-600">品牌</label>
                  <select
                    className="w-full rounded-lg border border-default-200 px-3 py-2 text-sm bg-white"
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
                      <div key={m.id} className="flex items-center justify-between border rounded-lg px-3 py-2">
                        <div className="font-medium">{m.name}</div>
                        <span className="text-gray-400 text-xs">{m.brand ?? "未设置品牌"}</span>
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
                  onChange={(e) => setColorForm({ ...colorForm, hex: e.target.value })}
                />
              </div>
              <Button variant="primary" isDisabled={!colorForm.name} onPress={handleCreateColor}>
                保存颜色
              </Button>
            </Card>

            <Card className="p-4">
              <div className="text-base font-semibold mb-2">已有颜色</div>
              <div className="flex flex-wrap gap-2">
                {colors.map((c) => (
                  <Chip key={c.id} color="default" variant="soft" className="flex items-center gap-1">
                    <span
                      aria-hidden
                      className="inline-flex w-3 h-3 rounded-full"
                      style={{ background: c.hex ?? "#ccc" }}
                    />
                    {c.name}
                  </Chip>
                ))}
                {!colors.length && <p className="text-xs text-gray-400">暂无数据</p>}
              </div>
            </Card>
          </div>
        )}

        {/* 图片管理 */}
        {activeTab === "images" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="p-4 space-y-3 lg:col-span-1">
              <div className="text-base font-semibold">批量导入图片</div>
              <div className="space-y-1">
                <label htmlFor="image-urls" className="text-sm text-gray-600">
                  图片 URL（换行或逗号分隔）
                </label>
                <TextArea
                  id="image-urls"
                  rows={4}
                  placeholder="https://.../1.png\nhttps://.../2.png"
                  value={imageForm.urls}
                  onChange={(e) => setImageForm({ ...imageForm, urls: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm text-gray-600">绑定型号</label>
                <select
                  className="w-full rounded-lg border border-default-200 px-3 py-2 text-sm bg-white"
                  value={imageForm.model_id}
                  onChange={(e) => setImageForm({ ...imageForm, model_id: e.target.value })}
                >
                  <option value="">可选</option>
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
                  className="w-full rounded-lg border border-default-200 px-3 py-2 text-sm bg-white"
                  value={imageForm.color_id}
                  onChange={(e) => setImageForm({ ...imageForm, color_id: e.target.value })}
                >
                  <option value="">可选</option>
                  {colors.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <Button variant="primary" isDisabled={!imageForm.urls.trim()} onPress={handleCreateImages}>
                导入并绑定
              </Button>
            </Card>

            <Card className="p-4 lg:col-span-2">
              <div className="text-base font-semibold mb-3">图片库</div>
              {loading ? (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Spinner size="sm" /> 加载中
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {images.map((img) => (
                    <div key={img.id} className="border rounded-lg overflow-hidden shadow-xs bg-white">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img.url} alt="图片" className="w-full h-32 object-cover" />
                      <div className="p-2 text-xs text-gray-600 space-y-1">
                        <div className="font-medium">#{img.id}</div>
                        <div className="text-gray-400 truncate">{img.url}</div>
                        <div className="flex gap-1 flex-wrap">
                          {img.model_id && <Chip size="sm" color="success" variant="soft">型号 {img.model_id}</Chip>}
                          {img.color_id && <Chip size="sm" color="warning" variant="soft">颜色 {img.color_id}</Chip>}
                        </div>
                      </div>
                    </div>
                  ))}
                  {!images.length && <p className="text-xs text-gray-400">暂无图片</p>}
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
                          onPress={() => copyLink(link)}
                        >
                          <Copy className="w-4 h-4" />
                          复制链接
                        </Button>
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
