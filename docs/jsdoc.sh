#!/bin/bash
if [ -n "$1" ]; then
    files=$1
else
    files="../src"
fi

java -jar jsdoc-toolkit/jsrun.jar jsdoc-toolkit/app/run.js -t=jsdoc-toolkit/templates/jsdoc -d=doc-generated -r=4 $files
