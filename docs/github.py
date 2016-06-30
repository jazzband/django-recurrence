from docutils import nodes, utils
from docutils.parsers.rst.roles import set_classes


# With thanks to Doug Hellman for writing
# https://doughellmann.com/blog/2010/05/09/defining-custom-roles-in-sphinx/
# - this code is derived from an example BitBucket configuration.


def make_issue_node(rawtext, app, slug, options):
    """Create a link to a GitHub issue.

    :param rawtext: Text being replaced with link node.
    :param app: Sphinx application context
    :param slug: ID of the thing to link to
    :param options: Options dictionary passed to role func.
    """
    #
    try:
        base = app.config.github_project_url
        if not base:
            raise AttributeError
    except AttributeError as err:
        raise ValueError('github_project_url configuration value is not set (%s)' % str(err))

    slash = '/' if base[-1] != '/' else ''
    ref = base + slash +  'issues/' + slug + '/'
    set_classes(options)
    node = nodes.reference(rawtext, '#' + utils.unescape(slug), refuri=ref,
                           **options)
    return node


def ghissue_role(name, rawtext, text, lineno, inliner, options={}, content=[]):
    """Link to a GitHub issue.

    Returns 2 part tuple containing list of nodes to insert into the
    document and a list of system messages.  Both are allowed to be
    empty.

    :param name: The role name used in the document.
    :param rawtext: The entire markup snippet, with role.
    :param text: The text marked with the role.
    :param lineno: The line number where rawtext appears in the input.
    :param inliner: The inliner instance that called us.
    :param options: Directive options for customization.
    :param content: The directive content for customization.
    """
    try:
        issue_num = int(text)
        if issue_num <= 0:
            raise ValueError
    except ValueError:
        msg = inliner.reporter.error(
            'GitHub issue number must be a number greater than or equal to 1; '
            '"%s" is invalid.' % text, line=lineno)
        prb = inliner.problematic(rawtext, rawtext, msg)
        return [prb], [msg]
    app = inliner.document.settings.env.app
    node = make_issue_node(rawtext, app, str(issue_num), options)
    return [node], []


def setup(app):
    """Install the plugin.

    :param app: Sphinx application context.
    """
    app.add_role('issue', ghissue_role)
    app.add_config_value('github_project_url', None, 'env')
    return
