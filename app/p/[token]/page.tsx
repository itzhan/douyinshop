import { notFound } from "next/navigation";
import Image from "next/image";
import { getProductByToken } from "@/lib/queries";
import Shop from "@/public/shop.svg";

export const revalidate = 0;

type Props = {
  params: { token: string };
};

export default async function SharePage({ params }: Props) {
  const product = await getProductByToken(params.token);
  if (!product) return notFound();

  const cover = product.cover_url ?? product.images?.[0]?.url ?? "";

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex justify-center py-4 font-sans text-[#333]">
      <div className="w-full max-w-[640px]">
        <div className="bg-white rounded-xl p-4 shadow-sm mx-3">
          <div className="flex items-center gap-2 mb-4">
            <Image src={Shop} alt="Shop Icon" className="w-5 h-5" />
            <span className="font-medium text-[15px]">抖音森林科技-批发号</span>
          </div>

          <div className="flex gap-3 mb-4">
            <div className="w-24 h-24 bg-gray-100 rounded-md flex-shrink-0 overflow-hidden">
              {cover ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={cover} alt={product.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">无封面</div>
              )}
            </div>

            <div className="flex-1 flex flex-col">
              <div className="flex justify-between items-start gap-2">
                <div className="text-[14px] text-black leading-tight pr-2">{product.title}</div>
                <div className="text-[15px] font-bold text-right text-[#ff5000]">¥ {product.price.toFixed(2)}</div>
              </div>

              <div className="flex justify-between items-end mt-1">
                <div className="text-gray-500 text-xs px-1 py-0.5 rounded">
                  {product.model_name ?? "型号未知"}；{product.color_name ?? "颜色未选"}
                </div>
                <div className="text-gray-400 text-xs">x1</div>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center mb-3">
            <span className="text-[13px] font-medium">实付款</span>
            <span className="text-[#ff5000] font-medium text-[18px]">¥ {(product.paid_amount ?? product.price).toFixed(2)}</span>
          </div>

          <div className="space-y-3 text-[13px]">
            <div className="flex justify-between items-center">
              <span className="text-gray-900 font-medium">订单编号：</span>
              <div className="flex items-center text-gray-500 gap-2">
                <span className="tracking-wide">{product.order_number ?? "未生成"}</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {product.images?.map((img) => (
                <div key={img.id} className="aspect-square bg-gray-100 rounded-md overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.url} alt={img.alt ?? "商品图片"} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
