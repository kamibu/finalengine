src_dir=$1
if [ $# -ne 1 ]; then
    echo "Assuming ../ as source directory"
    src_dir=../
fi
if [ ! -d $src_dir ]; then
    echo "Please give a valid directory as source directory"
    exit 1;
fi
if ! jshint $src_dir; then
    echo ""
    echo "Please fix these errors before building"
    exit 1;
fi
echo "Building..."
node build.js
