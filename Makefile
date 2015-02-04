coverage:
	py.test --cov-report html --cov-report term-missing --cov recurrence

test:
	py.test

testall:
	tox
