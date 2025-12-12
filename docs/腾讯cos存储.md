腾讯云
最新活动
HOT
产品
解决方案
定价
企业中心
云市场
开发者
客户支持
合作与生态
了解腾讯云
DeepSeek

中国站
文档
备案
控制台
1
对象存储

在目录中搜索
动态与公告
产品简介
购买指南
快速入门
操作指南
工具指南
实践教程
数据湖存储
向量存储与检索
数据处理
功能体验
故障处理
API 文档
SDK 文档
SDK 概览
准备工作
Android SDK
C SDK
iOS SDK
C++ SDK
.NET(C#) SDK
Flutter SDK
Go SDK
Java SDK
JavaScript SDK
Node.js SDK
Node.js SDK 常见问题
快速入门
存储桶操作
对象操作
上传对象
下载对象
复制与移动对象
列出对象
删除对象
判断对象是否存在
查询对象元数据
对象访问 URL
生成预签名 URL
恢复归档对象
服务端加密
预请求跨域配置
单链接限速
异地容灾
数据管理
访问管理
数据校验
云查毒
存储桶配置
图片处理
媒体处理
内容审核
内容识别
文档预览
文件处理
智能语音
智能检索 MetaInsight
任务与工作流
设置访问域名（CDN/全球加速）
异常处理
PHP SDK
Python SDK
React Native SDK
小程序 SDK
鸿蒙(Harmony) SDK
终端 SDK 质量优化
错误码
常见问题
相关协议
附录
联系我们
词汇表
文档中心入门中心API 中心SDK 中心文档活动我的反馈
文档反馈官招募中，报名立赚积分兑换代金券！> HOT
搜索相关文档
文档中心>对象存储>SDK 文档>Node.js SDK>对象操作>上传对象
上传对象
最近更新时间：2025-07-15 16:16:52

我的收藏
本页目录：
简介
注意事项
前期准备
高级接口
高级上传（推荐）
分块上传对象（断点续传）
批量上传
上传队列
简单操作
简单上传文件，适用于小文件上传
上传 Buffer 作为文件内容
下载文件流并上传
上传字符串作为文件内容
上传 base64作为文件内容
创建目录 a
自定义 Headers
上传文件到指定目录 a/b
上传对象（单链接限速）
参数说明
分块操作
流程介绍
使用案例：查询分块上传
使用案例：初始化分块上传
使用案例：上传分块
使用案例：查询已上传分块
使用案例：完成分块上传
使用案例：终止分块上传
API 操作
简介
本文介绍对象存储 COS 通过 Node.js SDK 实现上传对象功能的示例代码和描述。包括高级接口、简单接口、分块上传三个部分。
注意事项
若您使用简单上传，需要具有目标对象的写权限：在您进行 授权策略 时，action 需要设置为 cos:PutObject ，更多授权请参见 支持 CAM 的业务接口。
若您使用分块上传或者高级接口，需要具有目标对象的初始化分块上传、上传分块、完成分块上传的权限：在您进行 授权策略 时，action 需要设置为 cos:InitiateMultipartUpload，cos:ListMultipartUploads，cos:ListParts，cos:UploadPart，cos:CompleteMultipartUpload，更多授权请参见 支持 CAM 的业务接口。
前期准备
开始上传前，确保您已经完成了 SDK 初始化。
高级接口
强烈建议您使用高级接口，该类方法是对简单操作、分块操作方法的封装，实现了分块上传的全过程，支持并发分块上传，支持断点续传，支持上传任务的取消，暂停和重新开始等。
高级上传（推荐）
功能说明
uploadFile 实现高级上传，传入参数 SliceSize 可以控制文件大小超出一个数值（默认1MB）时自动使用分块上传（sliceUploadFile），否则使用简单上传(putObject)，其中分块上传默认支持断点续传。
SDK 内部决定是进行分块上传还是简单上传。
const filePath = 'temp-file-to-upload'; // 本地文件路径
cos.uploadFile({
    Bucket: 'examplebucket-1250000000', // 填入您自己的存储桶，必须字段
    Region: 'COS_REGION',  // 存储桶所在地域，例如 ap-beijing，必须字段
    Key: '1.jpg',  // 存储在桶里的对象键（例如1.jpg，a/b/test.txt），必须字段
    FilePath: filePath,                // 必须
    SliceSize: 1024 * 1024 * 5,     // 触发分块上传的阈值，超过5MB使用分块上传，非必须
    onTaskReady: function(taskId) {                   // 非必须
        console.log(taskId);
    },
    onProgress: function (progressData) {           // 非必须
        console.log(JSON.stringify(progressData));
    },
    // 支持自定义 headers 非必须
    Headers: {
      'x-cos-meta-test': 123
    },
}, function(err, data) {
    if (err) {
      console.log('上传失败', err);
    } else {
      console.log('上传成功', data);
    }
});
参数说明
参数名                                
参数描述
类型
是否必填
Bucket
存储桶的名称，命名格式为 BucketName-APPID，此处填写的存储桶名称必须为此格式
String
是
Region
存储桶所在地域，枚举值请参见 地域和访问域名﻿
String
是
Key
对象键（Object 的名称），对象在存储桶中的唯一标识，详情请参见 对象概述﻿
String
是
FilePath
上传文件路径
String
是
SliceSize
表示文件大小超出一个数值时使用分块上传，单位 Byte，默认值1048576（1MB），小于等于该数值会使用 putObject 上传，大于该数值会使用 sliceUploadFile 上传
Number
否
AsyncLimit
分块的并发量，仅在触发分块上传时有效
Number
否
StorageClass
对象的存储类型，枚举值：STANDARD、STANDARD_IA、ARCHIVE、DEEP_ARCHIVE 等，更多存储类型请参见 存储类型概述﻿
String
否
UploadAddMetaMd5
当上传时，给对象的元数据信息增加 x-cos-meta-md5 赋值为对象内容的 MD5 值，格式为 32 位小写字符串。例如：4d00d79b6733c9cc066584a02ed03410
String
否
CacheControl
RFC 2616中定义的缓存策略，将作为对象的元数据保存
String
否
ContentDisposition
RFC 2616中定义的文件名称，将作为对象的元数据保存
String
否
ContentEncoding
RFC 2616中定义的编码格式，将作为对象的元数据保存
String
否
ContentLength
RFC 2616中定义的 HTTP 请求内容长度（字节），当 Body 为 Stream 类型时，ContentLength 必填
String
否
ContentType
RFC 2616中定义的内容类型（MIME），将作为对象的元数据保存
String
否
Expires
RFC 2616中定义的过期时间，将作为对象的元数据保存，过期后仅代表缓存失效，文件不会被删除
String
否
Expect
当使用 Expect: 100-continue 时，在收到服务端确认后，才会发送请求内容
String
否
ACL
定义对象的访问控制列表（ACL）属性，枚举值请参见 ACL 概述 文档中对象的预设 ACL 部分，例如 default，private，public-read 等 
注意：如果您不需要进行对象 ACL 控制，请设置为 default 或者此项不进行设置，默认继承存储桶权限
String
否
GrantRead
赋予被授权者读取对象的权限，格式：id="[OwnerUin]"，可使用半角逗号（,）分隔多组被授权者：
当需要给子账号授权时，id="qcs::cam::uin/<OwnerUin>:uin/<SubUin>"
当需要给主账号授权时，id="qcs::cam::uin/<OwnerUin>:uin/<OwnerUin>"
例如：'id="qcs::cam::uin/100000000001:uin/100000000001"，id="qcs::cam::uin/100000000001:uin/100000000011"'
String
否
GrantReadAcp
赋予被授权者读取对象的访问控制列表（ACL）的权限，格式：id="[OwnerUin]"，可使用半角逗号（,）分隔多组被授权者：
当需要给子账号授权时，id="qcs::cam::uin/<OwnerUin>:uin/<SubUin>"
当需要给主账号授权时，id="qcs::cam::uin/<OwnerUin>:uin/<OwnerUin>"
例如：'id="qcs::cam::uin/100000000001:uin/100000000001", id="qcs::cam::uin/100000000001:uin/100000000011"'
String
否
GrantWriteAcp
赋予被授权者写入对象的访问控制列表（ACL）的权限，格式：id="[OwnerUin]"，可使用半角逗号（,）分隔多组被授权者：
当需要给子账号授权时，id="qcs::cam::uin/<OwnerUin>:uin/<SubUin>"
当需要给主账号授权时，id="qcs::cam::uin/<OwnerUin>:uin/<OwnerUin>"
例如：'id="qcs::cam::uin/100000000001:uin/100000000001", id="qcs::cam::uin/100000000001:uin/100000000011"'
String
否
GrantFullControl
赋予被授权者操作对象的所有权限，格式：id="[OwnerUin]"，可使用半角逗号（,）分隔多组被授权者：
当需要给子账号授权时，id="qcs::cam::uin/<OwnerUin>:uin/<SubUin>"
当需要给主账号授权时，id="qcs::cam::uin/<OwnerUin>:uin/<OwnerUin>"
例如：'id="qcs::cam::uin/100000000001:uin/100000000001", id="qcs::cam::uin/100000000001:uin/100000000011"'
String
否
x-cos-meta-[自定义后缀]
用户自定义元数据头部。例如 x-cos-meta-test: test metadata
注意：
用户自定义元数据头部固定格式为 x-cos-meta-[自定义后缀]，其中自定义后缀支持减号（-）、数字、英文（a～z）。英文字符的大写字母会被转成小写字母，不支持下划线（_）在内的其他字符。
用户自定义元数据头部没有数量限制，单条大小限制2KB，所有 x-cos-meta-[自定义后缀] 头部的总大小不超过4KB。
String
否
onFileFinish
每个文件完成或错误回调
Function
否
- err
上传的错误信息
Object
否
- data
文件完成的信息
Object
否
- options
当前完成文件的参数信息
Object
否
回调函数说明
function(err, data) { ... }
参数名
参数描述
类型
err
请求发生错误时返回的对象，包括网络错误和业务错误。如果请求成功则为空，更多详情请参见 错误码﻿
Object
- statusCode
请求返回的 HTTP 状态码，例如200、403、404等
Number
- headers
请求返回的头部信息
Object
data
请求成功时返回的对象，如果请求发生错误，则为空
Object
- statusCode
请求返回的 HTTP 状态码，例如200、403、404等
Number
- headers
请求返回的头部信息
Object
- RequestId
请求 ID
String
- Location
上传完的文件访问地址
String
- Bucket
分块上传的目标存储桶,仅在触发分块上传时返回
String
- Key
对象键（Object 的名称），对象在存储桶中的唯一标识，详情请参见 对象概述，仅在触发分块上传时返回
String
- ETag
合并后文件的唯一 ID，格式："uuid-<分块数>"
例如"22ca88419e2ed4721c23807c678adbe4c08a7880-3"，注意前后携带双引号
String
- VersionId
在开启过版本控制的存储桶中上传对象返回对象的版本 ID，存储桶从未开启则不返回该参数
String
- UploadId
触发分块上传时返回的分块上传任务 id
String
分块上传对象（断点续传）
功能说明
sliceUploadFile 可用于实现文件的分块上传，适用于大文件上传。
const filePath = 'temp-file-to-upload'; // 本地文件路径
cos.sliceUploadFile({
    Bucket: 'examplebucket-1250000000', // 填入您自己的存储桶，必须字段
    Region: 'COS_REGION',  // 存储桶所在地域，例如 ap-beijing，必须字段
    Key: '1.jpg',  // 存储在桶里的对象键（例如1.jpg，a/b/test.txt），必须字段
    FilePath: filePath,                // 必须
    onTaskReady: function(taskId) {                   // 非必须
        console.log(taskId);
    },
    onHashProgress: function (progressData) {       // 非必须
        console.log(JSON.stringify(progressData));
    },
    onProgress: function (progressData) {           // 非必须
        console.log(JSON.stringify(progressData));
    },
    // 支持自定义 headers 非必须
    Headers: {
      'x-cos-meta-test': 123
    },
}, function(err, data) {
    if (err) {
      console.log('上传失败', err);
    } else {
      console.log('上传成功', data);
    }
});
参数说明
参数名
参数描述
类型
是否必填
Bucket
存储桶的名称，命名格式为 BucketName-APPID，此处填写的存储桶名称必须为此格式
String
是
Region
存储桶所在地域，枚举值请参见 地域和访问域名﻿
String
是
Key
对象键（Object 的名称），对象在存储桶中的唯一标识，详情请参见 对象概述﻿
String
是
FilePath
上传文件路径
String
是
SliceSize
分块大小
Number
否
AsyncLimit
分块的并发量
Number
否
StorageClass
对象的存储类型，枚举值：STANDARD、STANDARD_IA、ARCHIVE 等，更多存储类型请参见 存储类型概述 文档
String
否
CacheControl
RFC 2616中定义的缓存策略，将作为对象的元数据保存
String
否
ContentDisposition
RFC 2616中定义的文件名称，将作为对象的元数据保存
String
否
ContentEncoding
RFC 2616中定义的编码格式，将作为对象的元数据保存
String
否
ContentLength
RFC 2616中定义的 HTTP 请求内容长度（字节），当 Body 为 Stream 类型时，ContentLength 必填
String
否
ContentType
RFC 2616中定义的内容类型（MIME），将作为对象的元数据保存
String
否
Expires
RFC 2616中定义的过期时间，将作为对象的元数据保存，过期后仅代表缓存失效，文件不会被删除
String
否
Expect
当使用 Expect: 100-continue 时，在收到服务端确认后，才会发送请求内容
String
否
ACL
定义对象的访问控制列表（ACL）属性，枚举值请参见 ACL 概述 文档中对象的预设 ACL 部分，例如 default，private，public-read 等 
注意：如果您不需要进行对象 ACL 控制，请设置为 default 或者此项不进行设置，默认继承存储桶权限
String
否
GrantRead
赋予被授权者读取对象的权限，格式：id="[OwnerUin]"，可使用半角逗号（,）分隔多组被授权者：
当需要给子账号授权时，id="qcs::cam::uin/<OwnerUin>:uin/<SubUin>"
当需要给主账号授权时，id="qcs::cam::uin/<OwnerUin>:uin/<OwnerUin>"
例如：'id="qcs::cam::uin/100000000001:uin/100000000001"，id="qcs::cam::uin/100000000001:uin/100000000011"'
String
否
GrantReadAcp
赋予被授权者读取对象的访问控制列表（ACL）的权限，格式：id="[OwnerUin]"，可使用半角逗号（,）分隔多组被授权者：
当需要给子账号授权时，id="qcs::cam::uin/<OwnerUin>:uin/<SubUin>"
当需要给主账号授权时，id="qcs::cam::uin/<OwnerUin>:uin/<OwnerUin>"
例如：'id="qcs::cam::uin/100000000001:uin/100000000001", id="qcs::cam::uin/100000000001:uin/100000000011"'
String
否
GrantWriteAcp
赋予被授权者写入对象的访问控制列表（ACL）的权限，格式：id="[OwnerUin]"，可使用半角逗号（,）分隔多组被授权者：
当需要给子账号授权时，id="qcs::cam::uin/<OwnerUin>:uin/<SubUin>"
当需要给主账号授权时，id="qcs::cam::uin/<OwnerUin>:uin/<OwnerUin>"
例如：'id="qcs::cam::uin/100000000001:uin/100000000001", id="qcs::cam::uin/100000000001:uin/100000000011"'
String
否
GrantFullControl
赋予被授权者操作对象的所有权限，格式：id="[OwnerUin]"，可使用半角逗号（,）分隔多组被授权者：
当需要给子账号授权时，id="qcs::cam::uin/<OwnerUin>:uin/<SubUin>"
当需要给主账号授权时，id="qcs::cam::uin/<OwnerUin>:uin/<OwnerUin>"
例如：'id="qcs::cam::uin/100000000001:uin/100000000001", id="qcs::cam::uin/100000000001:uin/100000000011"'
String
否
x-cos-meta-[自定义后缀]
用户自定义元数据头部。例如 x-cos-meta-test: test metadata
注意：
用户自定义元数据头部固定格式为 x-cos-meta-[自定义后缀]，其中自定义后缀支持减号（-）、数字、英文（a～z）。英文字符的大写字母会被转成小写字母，不支持下划线（_）在内的其他字符。
用户自定义元数据头部没有数量限制，单条大小限制2KB，所有 x-cos-meta-[自定义后缀] 头部的总大小不超过4KB。
String
否
onProgress
上传文件的进度回调函数，回调参数为进度对象 progressData
Function
否
- progressData.loaded
已经上传的文件部分大小，以字节（Bytes）为单位
Number
否
- progressData.total
整个文件的大小，以字节（Bytes）为单位
Number
否
- progressData.speed
文件的上传速度，以字节/秒（Bytes/s）为单位
Number
否
- progressData.percent
文件的上传百分比，以小数形式呈现，例如：上传50%即为0.5
Number
否
回调函数说明
function(err, data) { ... }
参数名
参数描述
类型
err
请求发生错误时返回的对象，包括网络错误和业务错误，如果请求成功则为空，更多详情请参见 错误码 文档
Object
- statusCode
请求返回的 HTTP 状态码，例如200、403、404等
Number
- headers
请求返回的头部信息
Object
data
请求成功时返回的对象，如果请求发生错误，则为空
Object
- statusCode
请求返回的 HTTP 状态码，例如200、403、404等
Number
- headers
请求返回的头部信息
Object
- RequestId
请求 ID
String
- Location
创建对象的外网访问域名
String
- Bucket
分块上传的目标存储桶
String
- Key
对象键（Object 的名称），对象在存储桶中的唯一标识，详情请参见 对象概述﻿
String
- ETag
合并后文件的唯一 ID，格式："uuid-<分块数>"
例如"22ca88419e2ed4721c23807c678adbe4c08a7880-3"，注意前后携带双引号
String
- VersionId
在开启过版本控制的存储桶中上传对象返回对象的版本 ID，存储桶从未开启则不返回该参数
String
- UploadId
分块上传返回的分块上传任务 id
String
批量上传
功能说明
方法一：
批量上传可以直接多次调用 putObject 和 sliceUploadFile，达到批量上传效果。通过实例化参数 FileParallelLimit 控制文件并发数，默认3个并发。
方法二：
可以调用 cos.uploadFiles 实现批量上传，传入参数 SliceSize 可以控制文件大小超出一个数值时使用分块上传。以下是 uploadFiles 方法说明。
const filePath1 = 'temp-file-to-upload'; // 本地文件路径
const filePath2 = 'temp2-file-to-upload'; // 本地文件路径
cos.uploadFiles({
    files: [{
        Bucket: 'examplebucket-1250000000', // 填入您自己的存储桶，必须字段
        Region: 'COS_REGION',  // 存储桶所在地域，例如 ap-beijing，必须字段
        Key: '1.jpg',  // 存储在桶里的对象键（例如1.jpg，a/b/test.txt），必须字段
        FilePath: filePath1,
        onTaskReady: function(taskId) {
          // taskId 可通过队列操作来取消上传 cos.cancelTask(taskId)、停止上传 cos.pauseTask(taskId)、重新开始上传 cos.restartTask(taskId)
          console.log(taskId);
        },
        // 支持自定义 headers 非必须
        Headers: {
          'x-cos-meta-test': 123
        },
    }, {
       Bucket: 'examplebucket-1250000000', // 填入您自己的存储桶，必须字段
        Region: 'COS_REGION',  // 存储桶所在地域，例如 ap-beijing，必须字段
        Key: '2.jpg',  // 存储在桶里的对象键（例如1.jpg，a/b/test.txt），必须字段
        FilePath: filePath2,
        onTaskReady: function(taskId) {
          // taskId 可通过队列操作来取消上传 cos.cancelTask(taskId)、停止上传 cos.pauseTask(taskId)、重新开始上传 cos.restartTask(taskId)
          console.log(taskId);
        },
        // 支持自定义 headers 非必须
        Headers: {
          'x-cos-meta-test': 123
        },
    }],
    SliceSize: 1024 * 1024 * 10,    // 设置大于10MB采用分块上传
    onProgress: function (info) {
        var percent = parseInt(info.percent * 10000) / 100;
        var speed = parseInt(info.speed / 1024 / 1024 * 100) / 100;
        console.log('进度：' + percent + '%; 速度：' + speed + 'Mb/s;');
    },
    onFileFinish: function (err, data, options) {
        console.log(options.Key + '上传' + (err ? '失败' : '完成'));
    },
}, function (err, data) {
    // 上传失败的任务
    const failedList = data.files.filter(item => item.error);
    console.log(failedList.length > 0 ? `部分失败:${failedList}` : '全部成功');
});
参数说明
参数名
参数描述
类型
是否必填
files
文件列表，每一项是传给 putObject 和 sliceUploadFile 的参数对象
Object
是
- Bucket
存储桶的名称，命名格式为 BucketName-APPID，此处填写的存储桶名称必须为此格式
String
是
- Region
存储桶所在地域，枚举值请参见 地域和访问域名﻿
String
是
- Key
对象键（Object 的名称），对象在存储桶中的唯一标识，详情请参见 对象概述﻿
String
是
- FilePath
上传文件路径
String
是
- CacheControl
RFC 2616中定义的缓存策略，将作为对象的元数据保存
String
否
- ContentDisposition
RFC 2616中定义的文件名称，将作为对象的元数据保存
String
否
- ContentEncoding
RFC 2616中定义的编码格式，将作为对象的元数据保存
String
否
- ContentLength
RFC 2616中定义的 HTTP 请求内容长度（字节）
String
否
- ContentType
RFC 2616中定义的内容类型（MIME），将作为对象的元数据保存
String
否
- Expires
RFC 2616中定义的过期时间，将作为对象的元数据保存
String
否
- Expect
当使用 Expect: 100-continue 时，在收到服务端确认后，才会发送请求内容
String
否
- onTaskReady
上传任务创建时的回调函数，返回一个 taskId，唯一标识上传任务，可用于上传任务的取消（cancelTask），停止（pauseTask）和重新开始（restartTask）
Function
否
-- taskId
上传任务的编号
String
否
SliceSize
表示文件大小超出一个数值时使用分块上传，单位 Byte，默认值1048576（1MB），小于等于该数值会使用 putObject 上传，大于该数值会使用 sliceUploadFile 上传
Number
是
onProgress
所有任务 进度汇总计算出来的上传进度
String
是
- progressData.loaded
已经上传的文件部分大小，以字节（Bytes）为单位
Number
否
- progressData.total
整个文件的大小，以字节（Bytes）为单位
Number
否
- progressData.speed
文件的上传速度，以字节/秒（Bytes/s）为单位
Number
否
- progressData.percent
文件的上传百分比，以小数形式呈现，例如：上传50%即为0.5
Number
否
onFileFinish
每个文件完成或错误回调
Function
否
- err
上传的错误信息
Object
否
- data
文件完成的信息
Object
否
- options
当前完成文件的参数信息
Object
否
回调函数说明
function(err, data) { ... }
参数名
参数描述
类型
err
固定为 null
Object
data
上传完成时返回的对象
Object
- files
每个文件的 error 或 data
ObjectArray
- - error
文件上传失败的错误信息
Object
- - data
文件上传成功的响应信息
Object
- - options
当前完成文件的参数信息
Object
上传队列
Node.js SDK 针对 uploadFile、putObject、sliceUploadFile 发起的上传任务都有记录队列里，队列相关方法如下。
var taskList = cos.getTaskList() 可以获取任务列表。
cos.pauseTask()、cos.restartTask()、cos.cancelTask() 操作任务。
cos.on('list-update', callback); 可以监听列表和进度变化。
完整的队列使用案例请参见 demo-queue。
注意事项
任务队列仅限当前 cos 实例操作，如下所示：
const cos1 = new COS({ ... });
const cos2 = new COS({ ... });
let taskId;
// 【！！注意！！】由 cos1发起的上传，无法使用 cos2来访问和操作
cos1.uploadFile({
    ....,
    onTaskReady(id) {
       taskId = id;
    },    
});
﻿
// 1. 获取任务列表
const list = cos2.getTaskList();  // list 为空[]，cos2实例无法获取cos1的队列
// 2. 暂停任务
cos2.pauseTask(taskId);  // 暂停无效，cos2实例无法操作 cos1的队列
使用案例：取消上传任务
根据 taskId 取消上传任务。无法通过 cos.restartTask(taskId) 重新上传，可以重新选择文件进行上传。
// taskId通过上传时回调(onTaskReady)获取
cos.cancelTask(taskId);
参数说明
参数名
参数描述
类型
是否必填
taskId
文件上传任务的编号，在调用 uploadFile/putObjec/sliceUploadFile 方法时，其 onTaskReady 回调会返回该上传任务的 taskId
String
是
使用案例：暂停上传任务
根据 taskId 暂停上传任务。暂停后可通过 cos.restartTask(taskId) 重新上传，分块上传任务将自动续传。
// taskId通过上传时回调(onTaskReady)获取
cos.pauseTask(taskId);
参数说明
参数名
参数描述
类型
是否必填
taskId
文件上传任务的编号，在调用  uploadFile/putObject/sliceUploadFile 方法时，其 onTaskReady 回调会返回该上传任务的 taskId
String
是
使用案例：重启上传任务
根据 taskId 重新开始上传任务，可以用于开启用户手动停止的（调用 pauseTask 停止）或者因为上传错误而停止的上传任务。
// taskId通过上传时回调(onTaskReady)获取
cos.restartTask(taskId);
参数说明
参数名
参数描述
类型
是否必填
taskId
文件上传任务的编号，在调用  uploadFile/putObject/sliceUploadFile 方法时，其 onTaskReady 回调会返回该上传任务的 taskId
String
是
简单操作
PUT Object 接口可以上传一个对象至指定存储桶中，该操作需要请求者对存储桶有 WRITE 权限。最大支持上传不超过5GB的对象，5GB以上对象请使用 分块上传 或 高级接口 上传。
注意：
Key（文件名）不能以/结尾，否则会被识别为文件夹。
Key（文件名）同名上传默认为覆盖操作。若您未开启版本控制且不想覆盖云上文件时，请确保上传时的Key不重复。
每个主账号（即同一个 APPID），存储桶的 ACL 规则数量最多为1000条，对象 ACL 规则数量不限制。如果您不需要进行对象 ACL 控制，请在上传时不要设置，默认继承存储桶权限。
上传之后，您可以用同样的 Key 生成预签名链接（下载请指定 method 为 GET，具体接口说明见下文），分享到其他端来进行下载。但注意如果您的文件是私有读权限，那么预签名链接只有一定的有效期。
简单上传文件，适用于小文件上传
const filePath = "temp-file-to-upload"; // 本地文件路径
cos.putObject({
    Bucket: 'examplebucket-1250000000', // 填入您自己的存储桶，必须字段
    Region: 'COS_REGION',  // 存储桶所在地域，例如 ap-beijing，必须字段
    Key: '1.jpg',  // 存储在桶里的对象键（例如1.jpg，a/b/test.txt），必须字段
    // 当 Body 为 stream 类型时，ContentLength 必传，否则 onProgress 不能返回正确的进度信息
    Body: fs.createReadStream(filePath), // 上传文件对象，必须字段
    ContentLength: fs.statSync(filePath).size,
    onProgress: function(progressData) {
        console.log(JSON.stringify(progressData));
    }
}, function(err, data) {
    if (err) {
      console.log('上传失败', err);
    } else {
      console.log('上传成功', data);
    }
});
上传 Buffer 作为文件内容
cos.putObject({
    Bucket: 'examplebucket-1250000000', // 填入您自己的存储桶，必须字段
    Region: 'COS_REGION',  // 存储桶所在地域，例如 ap-beijing，必须字段
    Key: '1.txt',  // 存储在桶里的对象键（例如1.jpg，a/b/test.txt），必须字段
    Body: Buffer.from('hello!'), // 上传文件对象，必须字段
}, function(err, data) {
    if (err) {
      console.log('上传失败', err);
    } else {
      console.log('上传成功', data);
    }
});
下载文件流并上传
const { PassThrough } = require('stream');
const axios = require('axios');
const sourceUrl = 'https://xxx.com/1.jpg'; // 可访问的静态资源 url
const targetKey = '2.jpg';

axios({
  method: 'get',
  url: sourceUrl,
  responseType: 'stream'
}).then(response => {
  const req = response.data;
  const passThrough = new PassThrough();
  cos.putObject({
    Bucket: 'examplebucket-1250000000', // 填入您自己的存储桶，必须字段
    Region: 'COS_REGION',  // 存储桶所在地域，例如 ap-beijing，必须字段
    Key: targetKey,  // 必须
    Body: req.pipe(passThrough),  // 只传正文的流
  }, (err, data) => {
    if (err) {
      console.log('上传失败', err);
    } else {
      console.log('上传成功', data);
    }
  });
}).catch(e => {
  console.log('get source error', e);
});
上传字符串作为文件内容
cos.putObject({
    Bucket: 'examplebucket-1250000000', // 填入您自己的存储桶，必须字段
    Region: 'COS_REGION',  // 存储桶所在地域，例如 ap-beijing，必须字段
    Key: '1.txt',  // 存储在桶里的对象键（例如1.jpg，a/b/test.txt），必须字段
    Body: 'hello!', // 上传文件对象，必须字段
}, function(err, data) {
    if (err) {
      console.log('上传失败', err);
    } else {
      console.log('上传成功', data);
    }
});
上传 base64作为文件内容
var base64Url = 'data:image/png;base64,iVBORw0KGgo.....';
// 需要转为 Buffer上传
var body = Buffer.from(base64Url.split(',')[1] , 'base64');
cos.putObject({
    Bucket: 'examplebucket-1250000000', // 填入您自己的存储桶，必须字段
    Region: 'COS_REGION',  // 存储桶所在地域，例如 ap-beijing，必须字段
    Key: '1.png',  // 存储在桶里的对象键（例如1.jpg，a/b/test.txt），必须字段
    Body: body, // 上传文件对象，必须字段
}, function(err, data) {
    if (err) {
      console.log('上传失败', err);
    } else {
      console.log('上传成功', data);
    }
});
创建目录 a
cos.putObject({
    Bucket: 'examplebucket-1250000000', // 填入您自己的存储桶，必须字段
    Region: 'COS_REGION',  // 存储桶所在地域，例如 ap-beijing，必须字段
    Key: 'a/',  // 指定目录为 a，必须字段
    Body: '', // 指定为空，必须字段
}, function(err, data) {
    if (err) {
      console.log('上传失败', err);
    } else {
      console.log('上传成功', data);
    }
});
自定义 Headers
cos.putObject({
    Bucket: 'examplebucket-1250000000', // 填入您自己的存储桶，必须字段
    Region: 'COS_REGION',  // 存储桶所在地域，例如 ap-beijing，必须字段
    Key: '1.png',  // 存储在桶里的对象键（例如1.jpg，a/b/test.txt），必须字段
    Body: 'hello', // 上传文件对象，必须字段
    // 支持自定义headers 非必须
    Headers: {
      'x-cos-meta-test': 123
    },
}, function(err, data) {
    if (err) {
      console.log('上传失败', err);
    } else {
      console.log('上传成功', data);
    }
});
上传文件到指定目录 a/b
cos.putObject({
    Bucket: 'examplebucket-1250000000', // 填入您自己的存储桶，必须字段
    Region: 'COS_REGION',  // 存储桶所在地域，例如 ap-beijing，必须字段
    Key: 'a/b/1.jpg',  // 存储在桶里的对象键（例如1.jpg，a/b/test.txt），必须字段
    Body: fileObject, // 上传文件对象，必须字段
    onProgress: function(progressData) {
        console.log(JSON.stringify(progressData));
    }
}, function(err, data) {
    if (err) {
      console.log('上传失败', err);
    } else {
      console.log('上传成功', data);
    }
});
上传对象（单链接限速）
说明：
关于上传对象的限速说明，请参见 单链接限速。
cos.putObject({
    Bucket: 'examplebucket-1250000000', // 填入您自己的存储桶，必须字段
    Region: 'COS_REGION',  // 存储桶所在地域，例如 ap-beijing，必须字段
    Key: '1.jpg',  // 存储在桶里的对象键（例如1.jpg，a/b/test.txt），必须字段
    Body: fileObject, // 上传文件对象
    Headers: {
      'x-cos-traffic-limit': 819200, // 限速值设置范围为819200 - 838860800，单位默认为bit/s，即800Kb/s - 800Mb/s，如果超出该范围将返回400错误。
    },
    onProgress: function(progressData) {
        console.log(JSON.stringify(progressData));
    }
}, function(err, data) {
    if (err) {
      console.log('上传失败', err);
    } else {
      console.log('上传成功', data);
    }
});
参数说明
入参说明
参数名
参数描述
类型
是否必填
Bucket
存储桶的名称，命名格式为 BucketName-APPID，此处填写的存储桶名称必须为此格式
String
是
Region
存储桶所在地域，枚举值请参见 地域和访问域名﻿
String
是
Key
对象键（Object 的名称），对象在存储桶中的唯一标识，详情请参见 对象概述﻿
String
是
Body
上传文件的内容，可以为 FileStream、字符串、Buffer
Stream/Buffer/String
是
CacheControl
RFC 2616中定义的缓存策略，将作为对象的元数据保存
String
否
ContentDisposition
RFC 2616中定义的文件名称，将作为对象的元数据保存
String
否
ContentEncoding
RFC 2616中定义的编码格式，将作为对象的元数据保存
String
否
ContentLength
RFC 2616中定义的 HTTP 请求内容长度（字节），当 Body 为 Stream 类型时，ContentLength 必填
String
否
ContentType
RFC 2616中定义的内容类型（MIME），将作为对象的元数据保存
String
否
Expires
RFC 2616中定义的过期时间，将作为对象的元数据保存，过期后仅代表缓存失效，文件不会被删除
String
否
Expect
当使用 Expect: 100-continue 时，在收到服务端确认后，才会发送请求内容
String
否
ACL
定义对象的访问控制列表（ACL）属性，枚举值请参见 ACL 概述 文档中对象的预设 ACL 部分，例如 default，private，public-read 等 
注意：如果您不需要进行对象 ACL 控制，请设置为 default 或者此项不进行设置，默认继承存储桶权限
String
否
GrantRead
赋予被授权者读取对象的权限，格式：id="[OwnerUin]"，可使用半角逗号（,）分隔多组被授权者：
当需要给子账号授权时，id="qcs::cam::uin/<OwnerUin>:uin/<SubUin>"
当需要给主账号授权时，id="qcs::cam::uin/<OwnerUin>:uin/<OwnerUin>"
例如：'id="qcs::cam::uin/100000000001:uin/100000000001"，id="qcs::cam::uin/100000000001:uin/100000000011"'
String
否
GrantReadAcp
赋予被授权者读取对象的访问控制列表（ACL）的权限，格式：id="[OwnerUin]"，可使用半角逗号（,）分隔多组被授权者：
当需要给子账号授权时，id="qcs::cam::uin/<OwnerUin>:uin/<SubUin>"
当需要给主账号授权时，id="qcs::cam::uin/<OwnerUin>:uin/<OwnerUin>"
例如：'id="qcs::cam::uin/100000000001:uin/100000000001", id="qcs::cam::uin/100000000001:uin/100000000011"'
String
否
GrantWriteAcp
赋予被授权者写入对象的访问控制列表（ACL）的权限，格式：id="[OwnerUin]"，可使用半角逗号（,）分隔多组被授权者：
当需要给子账号授权时，id="qcs::cam::uin/<OwnerUin>:uin/<SubUin>"
当需要给主账号授权时，id="qcs::cam::uin/<OwnerUin>:uin/<OwnerUin>"
例如：'id="qcs::cam::uin/100000000001:uin/100000000001", id="qcs::cam::uin/100000000001:uin/100000000011"'
String
否
GrantFullControl
赋予被授权者操作对象的所有权限，格式：id="[OwnerUin]"，可使用半角逗号（,）分隔多组被授权者：
当需要给子账号授权时，id="qcs::cam::uin/<OwnerUin>:uin/<SubUin>"
当需要给主账号授权时，id="qcs::cam::uin/<OwnerUin>:uin/<OwnerUin>"
例如：'id="qcs::cam::uin/100000000001:uin/100000000001", id="qcs::cam::uin/100000000001:uin/100000000011"'
String
否
StorageClass
设置对象的存储类型，枚举值：STANDARD、STANDARD_IA、ARCHIVE 等，更多存储类型请参见 存储类型概述 文档。默认值：STANDARD
String
否
x-cos-meta-[自定义后缀]
用户自定义元数据头部。例如 x-cos-meta-test: test metadata
注意：
用户自定义元数据头部固定格式为 x-cos-meta-[自定义后缀]，其中自定义后缀支持减号（-）、数字、英文（a～z）。英文字符的大写字母会被转成小写字母，不支持下划线（_）在内的其他字符。
用户自定义元数据头部没有数量限制，单条大小限制2KB，所有 x-cos-meta-[自定义后缀] 头部的总大小不超过4KB。
String
否
onTaskReady
上传任务创建时的回调函数，返回一个 taskId，唯一标识上传任务，可用于上传任务的取消（cancelTask），停止（pauseTask）和重新开始（restartTask）
Function
否
- taskId
上传任务的编号
String
否
onProgress
进度的回调函数，进度回调响应对象（progressData）属性如下
Function
否
- progressData.loaded
已经上传的文件部分大小，以字节（Bytes）为单位
Number
否
- progressData.total
整个文件的大小，以字节（Bytes）为单位
Number
否
- progressData.speed
文件的上传速度，以字节/秒（Bytes/s）为单位
Number
否
- progressData.percent
文件上传的百分比，以小数形式呈现，例如：上传50%即为0.5
Number
否
回调函数说明
function(err, data) { ... }
参数名
参数描述
类型
err
请求发生错误时返回的对象，包括网络错误和业务错误，如果请求成功则为空，更多详情请参见 错误码 文档
Object
- statusCode
请求返回的 HTTP 状态码，例如200、403、404等
Number
- headers
请求返回的头部信息
Object
data
请求成功时返回的对象，如果请求发生错误，则为空
Object
- statusCode
请求返回的 HTTP 状态码，例如200、403、404等
Number
- headers
请求返回的头部信息
Object
- RequestId
请求 ID
String
- ETag
返回文件的 MD5算法校验值。ETag 的值可以用于检查对象在上传过程中是否有损坏
例如"09cba091df696af91549de27b8e7d0f6"，注意：这里的 ETag 值字符串前后带有双引号
String
- Location
创建对象的外网访问域名
String
- VersionId
在开启过版本控制的存储桶中上传对象返回对象的版本 ID，存储桶从未开启则不返回该参数
String
分块操作
流程介绍
分块上传的流程
初始化分块上传（Initiate Multipart Upload），得到 UploadId。
使用 UploadId 上传分块（Upload Part）。
完成分块上传（Complete Multipart Upload）。
分块续传的流程
如果没有记录 UploadId，则要先查询分块上传任务（List Multipart Uploads），得到对应文件的 UploadId。
使用 UploadId 列出已上传的分块（List Parts）。
使用 UploadId 上传剩余的分块（Upload Part）。
完成分块上传（Complete Multipart Upload）。
终止分块上传的流程
如果没有记录 UploadId，则查询分块上传任务（List Multipart Uploads），得到对应文件的 UploadId。
终止分块上传并删除已上传分块（Abort Multipart Upload）。
说明：
一般不需要关注以下方法，sliceUploadFile 已经封装了分块操作，直接调用即可。更推荐使用高级上传 uploadFile 方法。
使用案例：查询分块上传
功能说明
List Multipart Uploads 用来查询正在进行中的分块上传信息。单次最多列出1000个正在进行中的分块上传。
使用案例
获取前缀为 a 的未完成的 UploadId 列表，示例如下：
cos.multipartList({
    Bucket: 'examplebucket-1250000000', // 填入您自己的存储桶，必须字段
    Region: 'COS_REGION',  // 存储桶所在地域，例如 ap-beijing，必须字段
    Prefix: 'a',                        // 非必须
}, function(err, data) {
    console.log(err || data);
});
参数说明
参数名
参数描述
类型
是否必填
Bucket
存储桶的名称，命名格式为 BucketName-APPID，此处填写的存储桶名称必须为此格式
String
是
Region
存储桶所在地域，枚举值请参见 地域和访问域名﻿
String
是
Prefix
对象键前缀匹配，限定返回中只包含指定前缀的对象键。注意使用 prefix 查询时，返回的对象键 中仍会包含 Prefix
String
否
Delimiter
定界符。为一个分隔符号，用于对对象键进行分组。一般是传/。所有对象键从 Prefix 或从头（例如未指定 Prefix）到首个 delimiter 之间相同部分的路径归为一类，定义为 Common Prefix，然后列出所有 Common Prefix
String
否
EncodingType
规定返回值的编码格式，合法值：url
String
否
MaxUploads
设置最大返回的条目数量，合法取值为1 - 1000，默认1000
String
否
KeyMarker
与 upload-id-marker 一起使用
当 upload-id-marker 未被指定时：
ObjectName 字母顺序大于 key-marker 的条目将被列出
当 upload-id-marker 被指定时：
ObjectName 字母顺序大于 key-marker 的条目被列出
ObjectName 字母顺序等于 key-marker 且 UploadID 大于 upload-id-marker 的条目将被列出
String
否
UploadIdMarker
与 key-marker 一起使用
当 key-marker 未被指定时：
upload-id-marker 将被忽略
当 key-marker 被指定时：
ObjectName 字母顺序大于 key-marker 的条目被列出
ObjectName 字母顺序等于 key-marker 且 UploadID 大于 upload-id-marker 的条目将被列出
String
否
回调函数说明
function(err, data) { ... }
参数名                              
参数描述
类型
err
请求发生错误时返回的对象，包括网络错误和业务错误，如果请求成功则为空，更多详情请参见 错误码﻿
Object
- statusCode
请求返回的 HTTP 状态码，例如200、403、404等
Number
- headers
请求返回的头部信息
Object
data
请求成功时返回的对象，如果请求发生错误，则为空
Object
- statusCode
请求返回的 HTTP 状态码，例如200、403、404等
Number
- headers
请求返回的头部信息
Object
- RequestId
请求 ID
String
- Bucket
分块上传的目标存储桶
String
- Encoding-Type
规定返回值的编码格式，合法值：url
String
- KeyMarker
列出条目从该 key 值开始
String
- UploadIdMarker
列出条目从该 UploadId 值开始
String
- NextKeyMarker
假如返回条目被截断，则返回 NextKeyMarker 就是下一个条目的起点
String
- NextUploadIdMarker
假如返回条目被截断，则返回 UploadId 就是下一个条目的起点
String
- MaxUploads
设置最大返回的条目数量，合法取值为 1 - 1000
String
- IsTruncated
返回条目是否被截断，'true' 或者 'false'
String
- Prefix
对象键前缀匹配，限定返回中只包含指定前缀的对象键。
String
- Delimiter
定界符。为一个分隔符号，用于对对象键进行分组。一般是传/。所有对象键从 Prefix 或从头（如未指定 Prefix）到首个 delimiter 之间相同部分的路径归为一类，定义为 Common Prefix，然后列出所有 Common Prefix
String
- CommonPrefixs
将 prefix 到 delimiter 之间的相同路径归为一类，定义为 Common Prefix
ObjectArray
- - Prefix
显示具体的 Common Prefixs
String
- Upload
分块上传的信息集合
ObjectArray
- - Key
对象的名称，即对象键
String
- - UploadId
表示本次分块上传的 ID
String
- - StorageClass
表示分块的存储类型，枚举值：STANDARD、STANDARD_IA、ARCHIVE、DEEP_ARCHIVE 等，更多存储类型请参见 存储类型概述﻿
String
- - Initiator
表示本次上传发起者的信息
Object
- - - DisplayName
上传发起者的名称
String
- - - ID
上传发起者 ID，格式：qcs::cam::uin/<OwnerUin>:uin/<SubUin>
如果是主账号，<OwnerUin> 和 <SubUin> 是同一个值
String
- - Owner
表示这些分块持有者的信息
Object
- - - DisplayName
分块持有者的名称
String
- - - ID
分块持有者 ID，格式：qcs::cam::uin/<OwnerUin>:uin/<SubUin>
如果是主账号，<OwnerUin> 和 <SubUin> 是同一个值
String
- - Initiated
分块上传的起始时间
String
使用案例：初始化分块上传
功能说明
Initiate Multipart Upload 请求实现初始化分块上传，成功执行此请求后会返回 Upload ID ，用于后续的 Upload Part 请求。
使用案例
cos.multipartInit({
    Bucket: 'examplebucket-1250000000', // 填入您自己的存储桶，必须字段
    Region: 'COS_REGION',  // 存储桶所在地域，例如 ap-beijing，必须字段
    Key: '1.jpg',  // 存储在桶里的对象键（例如1.jpg，a/b/test.txt），必须字段
}, function(err, data) {
    console.log(err || data);
    if (data) {
      uploadId = data.UploadId;
    }
});
参数说明
参数名
参数描述
类型
是否必填
Bucket
存储桶的名称，命名格式为 BucketName-APPID，此处填写的存储桶名称必须为此格式
String
是
Region
存储桶所在地域，枚举值请参见 地域和访问域名﻿
String
是
Key
对象键（Object 的名称），对象在存储桶中的唯一标识，详情请参见 对象概述﻿
String
是
CacheControl
RFC 2616中定义的缓存策略，将作为对象的元数据保存
String
否
ContentDisposition
RFC 2616中定义的文件名称，将作为对象的元数据保存
String
否
ContentEncoding
RFC 2616中定义的编码格式，将作为对象的元数据保存
String
否
ContentType
RFC 2616中定义的内容类型（MIME），将作为对象的元数据保存
String
否
Expires
RFC 2616中定义的过期时间，将作为对象的元数据保存
String
否
ACL
定义对象的访问控制列表（ACL）属性，枚举值请参见 ACL 概述 文档中对象的预设 ACL 部分，如 default，private，public-read 等 
注意：如果您不需要进行对象 ACL 控制，请设置为 default 或者此项不进行设置，默认继承存储桶权限
String
否
GrantRead
赋予被授权者读取对象的权限，格式：id="[OwnerUin]"，可使用半角逗号（,）分隔多组被授权者：
当需要给子账户授权时，id="qcs::cam::uin/<OwnerUin>:uin/<SubUin>"
当需要给主账号授权时，id="qcs::cam::uin/<OwnerUin>:uin/<OwnerUin>"
例如：'id="qcs::cam::uin/100000000001:uin/100000000001"id="qcs::cam::uin/100000000001:uin/100000000011"'
String
否
GrantFullControl
赋予被授权者操作对象的所有权限，格式：id="[OwnerUin]"，可使用半角逗号（,）分隔多组被授权者：
当需要给子账户授权时，id="qcs::cam::uin/<OwnerUin>:uin/<SubUin>"
当需要给主账号授权时，id="qcs::cam::uin/<OwnerUin>:uin/<OwnerUin>"
例如：'id="qcs::cam::uin/100000000001:uin/100000000001",id="qcs::cam::uin/100000000001:uin/100000000011"'
String
否
StorageClass
设置对象的存储类型，枚举值：STANDARD、STANDARD_IA、ARCHIVE、DEEP_ARCHIVE 等，默认值：STANDARD。更多存储类型请参见 存储类型概述﻿
String
否
x-cos-meta-[自定义后缀]
用户自定义元数据头部。例如 x-cos-meta-test: test metadata
注意：
用户自定义元数据头部固定格式为 x-cos-meta-[自定义后缀]，其中自定义后缀支持减号（-）、数字、英文（a～z）。英文字符的大写字母会被转成小写字母，不支持下划线（_）在内的其他字符。
用户自定义元数据头部没有数量限制，单条大小限制2KB，所有 x-cos-meta-[自定义后缀] 头部的总大小不超过4KB。
String
否
UploadAddMetaMd5
当上传时，给对象的元数据信息增加 x-cos-meta-md5 赋值为对象内容的 MD5 值，格式为 32 位小写字符串。例如：4d00d79b6733c9cc066584a02ed03410
String
否
回调函数说明
function(err, data) { ... }
参数名
参数描述
类型
err
请求发生错误时返回的对象，包括网络错误和业务错误。如果请求成功则为空，更多详情请参见 错误码﻿
Object
data
请求成功时返回的对象，如果请求发生错误，则为空
Object
- statusCode
请求返回的 HTTP 状态码，例如200、403、404等
Number
- headers
请求返回的头部信息
Object
- RequestId
请求 ID
String
- Bucket
分块上传的目标存储桶，由用户自定义字符串和系统生成 APPID 数字串由中划线连接而成，例如 examplebucket-1250000000
String
- Key
对象键（Object 的名称），对象在存储桶中的唯一标识，详情请参见 对象概述﻿
String
- UploadId
在后续上传中使用的 ID
String
使用案例：上传分块
功能说明
Upload Part 接口请求实现在初始化以后的分块上传，支持的块的数量为1 - 10000，块的大小为1MB - 5GB。
分块上传首先要进行初始化，用 Initiate Multipart Upload 接口初始化分块上传，得到一个 uploadId，该 ID 不但唯一标识这一分块数据，也标识了这分块数据在整个文件内的相对位置。
在每次请求 Upload Part 时候，需要携带 partNumber 和 uploadId，partNumber 为块的编号，支持乱序上传。
当传入 uploadId 和 partNumber 都相同的时候，后传入的块将覆盖之前传入的块。当 uploadId 不存在时会返回404错误，错误码为 NoSuchUpload。
使用案例
cos.multipartUpload({
    Bucket: 'examplebucket-1250000000', // 填入您自己的存储桶，必须字段
    Region: 'COS_REGION',  // 存储桶所在地域，例如 ap-beijing，必须字段
    Key: '1.jpg',  // 存储在桶里的对象键（例如1.jpg，a/b/test.txt），必须字段
    UploadId: 'exampleUploadId',
    PartNumber: 1,
    Body: fs.createReadStream(filePath),
    ContentLength: fs.statSync(filePath).size,
}, function(err, data) {
    console.log(err || data);
    if (data) {
      eTag = data.ETag;
    }
});
参数说明
参数名
参数描述
类型
是否必填
Bucket
存储桶的名称，命名格式为 BucketName-APPID，此处填写的存储桶名称必须为此格式
String
是
Region
存储桶所在地域，枚举值请参见 地域和访问域名﻿
String
是
Key
对象键（Object 的名称），对象在存储桶中的唯一标识，详情请参见 对象概述﻿
String
是
ContentLength
RFC 2616中定义的 HTTP 请求内容长度（字节）
String
是
PartNumber
分块的编号
Number
是
UploadId
本次分块上传任务的编号
String
是
Body
上传文件分块的内容，可以为字符串，File 对象或者 Blob 对象
String\File\Blob\ArrayBuffer
是
Expect
RFC 2616中定义的 HTTP 请求内容长度（字节）。当使用Expect: 100-continue 时，在收到服务端确认后，才会发送请求内容
String
否
ContentMD5
RFC 1864中定义的经过 Base64编码的128-bit 内容 MD5校验值，此头部用来校验文件内容是否发生变化
String
否
回调函数说明
function(err, data) { ... }
参数名
参数描述
类型
err
请求发生错误时返回的对象，包括网络错误和业务错误。如果请求成功则为空，更多详情请参见 错误码﻿
Object
- statusCode
请求返回的 HTTP 状态码，例如200、403、404等
Number
- headers
请求返回的头部信息
Object
data
请求成功时返回的对象，如果请求发生错误，则为空
Object
- statusCode
请求返回的 HTTP 状态码，例如200、403、404等
Number
- headers
请求返回的头部信息
Object
- RequestId
请求 ID
String
使用案例：查询已上传分块
功能说明
List Parts 用来查询特定分块上传中的已上传的块，即列出指定 UploadId 所属的所有已上传成功的分块。
使用案例
cos.multipartListPart({
    Bucket: 'examplebucket-1250000000', // 填入您自己的存储桶，必须字段
    Region: 'COS_REGION',  // 存储桶所在地域，例如ap-beijing，必须字段
    Key: '1.jpg',  // 存储在桶里的对象键（例如1.jpg，a/b/test.txt），必须字段
    UploadId: 'exampleUploadId',    // 必须
}, function(err, data) {
    console.log(err || data);
});
参数说明
参数名
参数描述
类型
是否必填
Bucket
存储桶的名称，命名格式为 BucketName-APPID，此处填写的存储桶名称必须为此格式
String
是
Region
存储桶所在地域，枚举值请参见 地域和访问域名﻿
String
是
Key
对象键（Object 的名称），对象在存储桶中的唯一标识，详情请参见 对象概述﻿
String
是
UploadId
标识本次分块上传的 ID，使用 Initiate Multipart Upload 接口初始化分块上传时得到的 UploadId
String
是
EncodingType
规定返回值的编码方式
String
否
MaxParts
单次返回最大的条目数量，默认1000
String
否
PartNumberMarker
默认以 UTF-8 二进制顺序列出条目，所有列出条目从 marker 开始
String
否
回调函数说明
function(err, data) { ... }
参数名
参数描述
类型
err
请求发生错误时返回的对象，包括网络错误和业务错误。如果请求成功则为空，更多详情请参见 错误码﻿
Object
- statusCode
请求返回的 HTTP 状态码，例如200、403、404等
Number
- headers
请求返回的头部信息
Object
data
请求成功时返回的对象，如果请求发生错误，则为空
Object
- statusCode
请求返回的 HTTP 状态码，例如200、403、404等
Number
- headers
请求返回的头部信息
Object
- RequestId
请求 ID
String
- Bucket
分块上传的目标存储桶
String
- Encoding-type
规定返回值的编码方式
String
- Key
对象键（Object 的名称），对象在存储桶中的唯一标识，详情请参见 对象概述﻿
String
- UploadId
标识本次分块上传的 ID
String
- Initiator
用来表示本次上传发起者的信息
Object
- - DisplayName
上传发起者的名称
String
- - ID
上传发起者 ID，格式：qcs::cam::uin/<OwnerUin>:uin/<SubUin>，如果是主账号，<OwnerUin> 和 <SubUin> 是同一个值
String
- Owner
用来表示这些分块所有者的信息
Object
- - DisplayName
存储桶持有者的名称
String
- - ID
存储桶持有者 ID，一般为用户的 UIN
String
- StorageClass
用来表示这些分块的存储类型，枚举值：STANDARD、STANDARD_IA、ARCHIVE、DEEP_ARCHIVE 等，更多存储类型请参见 存储类型概述﻿
String
- PartNumberMarker
默认以 UTF-8二进制顺序列出条目，所有列出条目从 marker 开始
String
- NextPartNumberMarker
假如返回条目被截断，则返回 NextMarker 就是下一个条目的起点
String
- MaxParts
单次返回最大的条目数量
String
- IsTruncated
返回条目是否被截断，'true' 或者 'false'
String
- Part
分块信息列表
ObjectArray
- - PartNumber
块的编号
String
- - LastModified
块最后修改时间
String
- - ETag
块的 MD5算法校验值
String
- - Size
块大小，单位 Byte
String
使用案例：完成分块上传
功能说明
Complete Multipart Upload 接口请求用来实现完成整个分块上传。当使用 Upload Parts 上传完所有块以后，必须调用该 API 来完成整个文件的分块上传。在使用该 API 时，您必须在请求 Body 中给出每一个块的 PartNumber 和 ETag，用来校验块的准确性。
由于分块上传完后需要合并，而合并需要数分钟时间，因而当合并分块开始的时候，COS 就立即返回200的状态码，在合并的过程中，COS 会周期性的返回空格信息来保持连接活跃，直到合并完成，COS 会在 Body 中返回合并后块的内容。
当上传块小于1MB的时候，在调用该 API 时，会返回400 EntityTooSmall。
当上传块编号不连续的时候，在调用该 API 时，会返回400 InvalidPart。
当请求 Body 中的块信息没有按序号从小到大排列的时候，在调用该 API 时，会返回400 InvalidPartOrder。
当 UploadId 不存在的时候，在调用该 API 时，会返回404 NoSuchUpload。
注意：
建议您及时完成分块上传或者舍弃分块上传，因为已上传但是未终止的块会占用存储空间进而产生存储费用。
使用案例
cos.multipartComplete({
    Bucket: 'examplebucket-1250000000', // 填入您自己的存储桶，必须字段
    Region: 'COS_REGION',  // 存储桶所在地域，例如 ap-beijing，必须字段
    Key: '1.jpg',  // 存储在桶里的对象键（例如1.jpg，a/b/test.txt），必须字段
    UploadId: 'exampleUploadId', // 必须
    Parts: [
        {PartNumber: 1, ETag: 'exampleETag'},
    ]
}, function(err, data) {
    console.log(err || data);
});
参数说明
参数名
参数描述
类型
是否必填
Bucket
存储桶的名称，命名格式为 BucketName-APPID，此处填写的存储桶名称必须为此格式
String
是
Region
存储桶所在地域，枚举值请参见 地域和访问域名﻿
String
是
Key
对象键（Object 的名称），对象在存储桶中的唯一标识，详情请参见 对象概述﻿
String
是
UploadId
上传任务编号
String
是
Parts
用来说明本次分块上传中块的信息列表
ObjectArray
是
- PartNumber
分块的编号
Number
是
- ETag
每个块文件的 MD5 算法校验值
例如"22ca88419e2ed4721c23807c678adbe4c08a7880"，注意前后携带双引号
String
是
回调函数说明
function(err, data) { ... }
参数名
参数描述
类型
err
请求发生错误时返回的对象，包括网络错误和业务错误。如果请求成功则为空，更多详情请参见 错误码﻿
Object
- statusCode
请求返回的 HTTP 状态码，例如200、403、404等
Number
- headers
请求返回的头部信息
Object
data
请求成功时返回的对象，如果请求发生错误，则为空
Object
- statusCode
请求返回的 HTTP 状态码，例如200、403、404等
Number
- headers
请求返回的头部信息
Object
- RequestId
请求 ID
String
- Location
上传完的文件访问地址
String
- Bucket
分块上传的目标存储桶
String
- Key
对象键（Object 的名称），对象在存储桶中的唯一标识，详情请参见 对象概述﻿
String
- ETag
合并后文件的唯一 ID，格式："uuid-<分块数>"
例如"22ca88419e2ed4721c23807c678adbe4c08a7880-3"，注意前后携带双引号
String
使用案例：终止分块上传
功能说明
Abort Multipart Upload 用来实现终止一个分块上传操作并删除已上传的块。当您调用 Abort Multipart Upload 时，如果有正在使用这个 UploadId 上传块的请求，则 Upload Parts 会返回失败。当该 UploadId 不存在时，会返回404 NoSuchUpload。
注意：
建议您及时完成分块上传或者舍弃分块上传，因为已上传但是未终止的块会占用存储空间进而产生存储费用。
使用案例
cos.multipartAbort({
    Bucket: 'examplebucket-1250000000', // 填入您自己的存储桶，必须字段
    Region: 'COS_REGION',  // 存储桶所在地域，例如 ap-beijing，必须字段
    Key: '1.jpg',  // 存储在桶里的对象键（例如1.jpg，a/b/test.txt），必须字段
    UploadId: 'exampleUploadId'    // 必须
}, function(err, data) {
    console.log(err || data);
});
参数说明
参数名
参数描述
类型
是否必填
Bucket
存储桶的名称，命名格式为 BucketName-APPID，此处填写的存储桶名称必须为此格式
String
是
Region
存储桶所在地域，枚举值请参见 地域和访问域名﻿
String
是
Key
对象键（Object 的名称），对象在存储桶中的唯一标识，详情请参见 对象概述﻿
String
是
UploadId
标识本次分块上传的 ID，使用 Initiate Multipart Upload 接口初始化分块上传时得到的 UploadId
String
是
回调函数说明
function(err, data) { ... }
参数名
参数描述
类型
err
请求发生错误时返回的对象，包括网络错误和业务错误。如果请求成功则为空，更多详情请参见 错误码﻿
Object
- statusCode
请求返回的 HTTP 状态码，例如200、403、404等
Number
- headers
请求返回的头部信息
Object
data
请求成功时返回的对象，如果请求发生错误，则为空
Object
- statusCode
请求返回的 HTTP 状态码，例如200、403、404等
Number
- headers
请求返回的头部信息
Object
- RequestId
请求 ID
String
API 操作
关于简单操作的 API 接口说明，请参见 PUT Object 文档。
关于分块操作的 API 接口说明，请参见 List Multipart Uploads  、Initiate Multipart Upload 、Upload Part 、List Parts、Abort Multipart Upload、Complete Multipart Upload文档。
上一篇: 存储桶操作下一篇: 下载对象
文档内容是否对您有帮助？
有帮助没帮助
如果遇到产品相关问题，您可咨询 在线客服寻求帮助。

对象存储 相关文档
简介
SDK 概览
免费额度
简单上传文件
地域和访问域名
请求签名
JavaScript SDK
操作列表
FTP Server 工具
Copyright © 2013-2025 Tencent Cloud. All Rights Reserved. 腾讯云 版权所有
深圳市腾讯计算机系统有限公司ICP备案/许可证号：粤B2-20090059
粤公网安备44030502008569号

腾讯云计算（北京）有限责任公司京ICP证150476号 | 京ICP备11018762号
中国站

