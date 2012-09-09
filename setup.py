import os
try:
    from setuptools import setup
    setuptools = True
except ImportError:
    from distutils.core import setup
    setuptools = False


if setuptools:
    setup_options = dict(
        install_requires=(
            'pytz',
            'python-dateutil',
        ),
        zip_safe=False,
        include_package_data=True,
    )
else:
    setup_options = dict(
        requires=(
            'pytz',
            'python_dateutil',
        ),
    )


setup(
    name='django-recurrence',
    version='0.1',
    license='BSD',

    description='Django utility wrapping dateutil.rrule',
    author='Tamas Kemenczy',
    author_email='tamas.kemenczy@gmail.com',

    classifiers=(
        'Development Status :: 2 - Pre-Alpha',
        'Environment :: Web Environment',
        'Framework :: Django',
        'Intended Audience :: Developers',
        'License :: OSI Approved :: BSD License',
        'Operating System :: OS Independent',
        'Programming Language :: Python',
    ),

    requires=(
        'pytz',
        'python_dateutil',
    ),

    packages=(
        'recurrence',
    ),
    package_dir={
        'recurrence': 'recurrence'
    },
    package_data={
        'recurrence': [
            os.path.join('static', '*.css'),
            os.path.join('static', '*.png'),
            os.path.join('static', '*.js'),
            os.path.join('locale','*.po'),
            os.path.join('locale', '*.mo'),
        ],
    },

    **setup_options
)
