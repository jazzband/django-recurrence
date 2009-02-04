try:
    from setuptools import setup
    setuptools = True
except ImportError:
    from distutils.core import setup
    setuptools = False


if setuptools:
    setup_options = dict(zip_safe=False)
else:
    setup_options = dict()


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

    install_requires=(
        'pytz',
        'python-dateutil',
    ),

    packages=(
        'recurrence',
    ),
    package_dir={
        'recurrence': 'recurrence'
    },
    package_data={
        'recurrence': [
            'media/css/*.css',
            'media/img/*.png',
            'media/js/*.js',
        ],
    },

    **setup_options
)
