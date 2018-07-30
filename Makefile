coverage:
	py.test --cov-report html --cov-report term-missing --cov recurrence

test:
	py.test

testall:
	tox

build: clean
	python setup.py sdist bdist_wheel

clean:
	rm -rf dist/*
	rm -rf build/*

push:
	twine upload -r pypi dist/*

.PHONY: coverage test testall build clean push
