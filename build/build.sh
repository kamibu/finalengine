cur_dir=`dirname $0`
cd $cur_dir

if ! jshint ../src; then
    echo ""
    echo "Please fix these errors before building"
    exit 1;
fi

echo -n "Building..."
node build.js
echo "OK"
