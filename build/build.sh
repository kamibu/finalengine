cur_dir=`dirname $0`
src_dir="$cur_dir/../src"

if ! jshint $src_dir; then
    echo ""
    echo "Please fix these errors before building"
    exit 1;
fi

echo -n "Building..."
node "$cur_dir/build.js"
echo "OK"
