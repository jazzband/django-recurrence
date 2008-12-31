from setuptools import setup, find_packages


setup(
    name='recurrence',
    version='0.1',
    license='BSD',
    description='Django utility wrapping dateutil.rrule',

    author='Imaginary Landscape',
    author_email='devel@imagescape.com',

    install_required=(
        'pytz',
        'python-dateutil',
    ),

    classifiers=(
        'Development Status :: 2 - Pre-Alpha',
        'Environment :: Web Environment',
        'Framework :: Django',
        'Intended Audience :: Developers',
        'License :: OSI Approved :: BSD License',
        'Operating System :: OS Independent',
        'Programming Language :: Python',
    ),

    zip_safe=False,
    include_package_data=True,
    packages=find_packages(exclude=('ez_setup', 'examples', 'tests')),
)
