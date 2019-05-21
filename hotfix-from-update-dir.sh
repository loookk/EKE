# !/bin/sh
# 从update文件夹生成热更新包
# $1 地区
# 使用示例 bash hotfix-from-update-dir.sh shandong

set -e

if [ ! $1 ] ; then
	echo "参数错误！ 使用示例 bash hotfix-from-update-dir.sh [地区名]" 1>&2
	exit 1
fi

assetsPath=/data/services/majiang/StreamingAssets;
updateAssetsPath=/data/services/majiang/update;
majiangPath=/data/services/majiang/server/trunk;
hotfixPackageDestPath=${majiangPath}/web-server/public/hotFix/$1;

# 确保文件夹存在
[ ! -d "${updateAssetsPath}" ] && mkdir -p ${updateAssetsPath};
[ ! -d "${hotfixPackageDestPath}" ] && mkdir -p ${hotfixPackageDestPath};
[ ! -d "${hotfixPackageDestPath}/android" ] && mkdir -p ${hotfixPackageDestPath}/android;
[ ! -d "${hotfixPackageDestPath}/ios" ] && mkdir -p ${hotfixPackageDestPath}/ios;

# 清理文件
cd ${updateAssetsPath}/$1
find . -type f -name ".DS_Store" -exec rm -rf {} \;
find . -type d -name ".svn" -prune -exec rm -rf {} \;
find . -type f -name "*.meta" -exec rm -rf {} \;

cd ${majiangPath}/web-server
node hotfix.js ${updateAssetsPath}/$1 ${hotfixPackageDestPath}

echo "热更新文件生成成功！";