#!/bin/bash

find . ! -iname "exporter.*" ! -iname "textured.json" ! -iname "texturedShader.json" ! -iname "clean.sh" ! -iname "." | xargs rm -f
