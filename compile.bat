rem use Google Compiler
@echo off
rem echo %~dp0
rem --js=common/const.js --js=core/core.js --js=core/module.js    --js=common/idAndLocation.js --js=common/
java -jar compiler.jar --js=begin.js --js=run.js --js_output_file=compiledMonkeyBean.js --compilation_level SIMPLE_OPTIMIZATIONS