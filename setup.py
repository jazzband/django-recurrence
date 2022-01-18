import os

from setuptools import setup

setup(
    name="django-recurrence",
    use_scm_version=True,
    license="BSD",
    description="Django utility wrapping dateutil.rrule",
    long_description=open("README.md", encoding="utf-8").read(),
    long_description_content_type="text/markdown",
    author="Tamas Kemenczy",
    author_email="tamas.kemenczy@gmail.com",
    url="https://github.com/django-recurrence/django-recurrence",
    classifiers=[
        "Development Status :: 5 - Production/Stable",
        "Environment :: Web Environment",
        "Environment :: Plugins",
        "Framework :: Django",
        "Framework :: Django",
        "Framework :: Django :: 2.2",
        "Framework :: Django :: 3.2",
        "Framework :: Django :: 4.0",
        "Intended Audience :: Developers",
        "License :: OSI Approved :: BSD License",
        "Operating System :: OS Independent",
        "Programming Language :: Python",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.7",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: Implementation",
        "Programming Language :: Python :: Implementation :: CPython",
        "Programming Language :: Python :: Implementation :: PyPy",
    ],
    python_requires=">=3.7",
    install_requires=["django>=2.2", "python-dateutil"],
    setup_requires=["setuptools_scm"],
    packages=["recurrence", "recurrence.migrations"],
    package_dir={"recurrence": "recurrence"},
    package_data={
        "recurrence": [
            os.path.join("static", "*.css"),
            os.path.join("static", "*.png"),
            os.path.join("static", "*.js"),
            os.path.join("locale", "*.po"),
            os.path.join("locale", "*.mo"),
        ]
    },
    zip_safe=False,
    include_package_data=True,
)
