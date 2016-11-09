track_develop:
	git checkout --track origin/develop

ui:
	cd stubo/static/ && node node_modules/webpack/bin/webpack.js

run:
	python run.py

tests:
	nosetests

nuke:
	git clean -df
	git checkout -- .
