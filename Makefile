.PHONY: demo
all: concat docs demo
concat:	src/*.js
	cat src/Plugin.js > Transitions.js
	printf "\r\n\r\n" >> Transitions.js
	cat src/Base.js >> Transitions.js
	printf "\r\n\r\n" >> Transitions.js
	find src/* \( ! -name Plugin.js -a ! -name Base.js \) -exec cat '{}' >> Transitions.js \; -exec printf "\r\n\r\n" >> Transitions.js \;
docs: src/*.js jsdoc-conf.json
	jsdoc -c jsdoc-conf.json
demo: .PHONY
	cp Transitions.js demo/js/plugins/Transitions.js
	zip -r release.zip demo
clean:
	rm -f Transitions.js
	rm -rf docs
	rm -rf release.zip
