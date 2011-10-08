#!/bin/bash

files='';
srcfolder='../src/';
option=' --js '$srcfolder;

for file in `cat files.list`; do
    files=$files$option$file;
done;

java -jar compiler.jar --jscomp_off nonStandardJsDocs --jscomp_off internetExplorerChecks --language_in ECMASCRIPT5 --compilation_level ADVANCED_OPTIMIZATIONS --warning_level VERBOSE --externs externs.js $files --formatting PRETTY_PRINT --js_output_file final-engine-debug.min.js
