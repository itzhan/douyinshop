import { ChevronDown, ChevronRight } from "lucide-react";
import Shop from "../public/shop.svg";
import Image from "next/image";

const OrderDetailCard = () => {
  return (
    <div className="min-h-screen bg-[#f5f5f5] flex justify-center py-4 font-sans text-[#333]">
      <div className="w-full max-w-[600px]">
        <div className="bg-white rounded-xl p-4 shadow-sm mx-3">
          <div className="flex items-center gap-2 mb-4">
            <Image src={Shop} alt="Shop Icon" className="w-5 h-5" />
            <span className="font-medium text-[15px]">抖音森林科技-批发号</span>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </div>

          <div className="flex gap-3 mb-4">
            <div className="w-21 h-21 bg-pink-200 rounded-md flex-shrink-0 relative overflow-hidden">
              <img
                src="	https://gw.alicdn.com/bao/uploaded/i3/1917047079/O1CN01gBK43s22AEjrFBzEX_!!1917047079.png_.webp"
                alt="iPhone 16"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex-1 flex flex-col">
              <div className="flex justify-between items-start">
                <div className="text-[14px] text-black leading-tight pr-2">森林科技批发 - iPhone16</div>
                <div className="text-[14px] font-bold text-right ">¥ 4800.00</div>
              </div>

              <div className="flex justify-between items-end mt-1">
                <div className="text-gray-500 text-xs px-1 py-0.5 rounded">iphone16；256g 粉色</div>
                <div className="text-gray-400 text-xs">x1</div>
              </div>
            </div>
          </div>

          <div className="flex justify-end mb-3">
            <button className="px-6 py-1 border border-gray-300 rounded-full text-xs text-gray-600 font-medium hover:bg-gray-50 transition-colors">
              退换
            </button>
          </div>

          <div className="flex justify-between items-center mb-5">
            <span className="text-[13px] font-medium">实付款</span>
            <span className="text-[#ff5000] font-medium text-[18px]">¥ 4800.00</span>
          </div>

          <div className="space-y-4 text-[13px]">
            <div className="flex justify-between items-center">
              <span className="text-gray-900 font-medium">订单编号：</span>
              <div className="flex items-center text-gray-500 gap-2">
                <span className="tracking-wide">53503758768282122620</span>
                <span className="text-gray-300">|</span>
                <button className="text-gray-800 font-medium">
                  复制
                </button>
              </div>
            </div>

            <div className="flex justify-between items-start">
              <span className="text-gray-900 pt-0.5 font-medium">交易快照</span>
              <div className="flex items-center gap-1 text-gray-400 ">
                <span>发生交易争议时，可作为判断依据</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

          <div className="mt-2 pt-3 flex justify-center">
            <button className="flex items-center gap-1 text-gray-400 text-xs">
              查看更多
              <ChevronDown className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function Home() {
  return <OrderDetailCard />;
}
