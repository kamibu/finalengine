src_dir=`dirname $0`
src_dir="$src_dir/../src"

if ! jshint $src_dir; then
    echo ""
    echo "Please fix these errors before building"
    exit 1;
fi

echo "Building..."
node build.js
