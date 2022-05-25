---
title: "blogit: A Complete Guide"
date: 2021-11-26T19:18:52+03:00
tags: [ "guide", "website" ]
---
Running a personal website should be an easy task. Unfortunately, a big
hindrance is that there aren't many "suckless" blogging system. 
[blogit](https://pedantic.software/git/blogit) is the closest in terms of 
simplicity and minimalism to perfection. This article would be an end-all be-all
guide to effectively install blogit onto your own website.
<!--more-->

# Installation
blogit advertises itself as a small static blog generator, and indeed the whole
project is comprised of a single script file. To install this file, first
navigate to your website's git directory then ```wget``` said script:

```bash
cd proj/website/
wget https://pedantic.software/git/blogit/raw/27d3f06259e83df2fed6fec7bbe77ac6b917eee7/blogit
chmod +x blogit
```

This might seem weird having a script in the home directory of your website, but
I couldn't find a better place to put it, especially when editing the actual
script is dependent on each website's setup (as seen later on).

blogit initializes the basic operational structure with the following command:

```bash
./blogit init
```

It is useful to let blogit build automatically on every git commit, so let's
configure that:

```bash
touch .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
echo "$!/bin/sh" > .git/hooks/pre-commit
echo "./blogit build" > .git/hooks/pre-commit
```

Then, open the ```blogit``` script with a text editor, search for ```exclude```
and delete the line where it outputs ```blog``` to git exclude. This 
functionality is meant for systems where the website's root is not the same as 
blogit's root.

# Configuration
blogit uses the file ```config``` in ```$(website)``` for its settings, so let's create it:

```bash
touch config
```

To get the list of settings available, run:

```bash
head -n 18 blogit
```

For my use case, this is what I set it up as:

```bash
BLOG_DATE_FORMAT:=%Y/%m/%d %H:%M
BLOG_DATE_FORMAT_INDEX:=%Y/%m/%d
BLOG_TITLE:=ayham's blog
BLOG_DESCRIPTION:=probably interesting stuff
BLOG_URL_ROOT:=articles.ayham.xyz
BLOG_FEED_MAX:=20
BLOG_FEEDS:=rss atom
BLOG_SRC:=articles
```

Everything should be self explainatory, except perhaps for ```BLOG_FEED*```.
```BLOG_FEED_MAX``` specifies the amount of rss and atom entries to generate,
whereas ```BLOG_FEEDS``` specify feed formats to generate.

The script can be molded for each case, examples of doing this is explained
later on.

# Building, and the Tag System
Setting tags for each article is super easy in blogit. For every article,
append this as a comment in the end of the file:

```bash
[semicolon] Tags: TAG1 TAG2
```

Finally, to build your blog:

```bash
./blogit build 
```

Now you should be able to navigate to ```$(website)/blog/index.html```.
Congratz!

# Miscellaneous 
Because blogit is a very small script, we can easily edit it to make add
features or to add complex styling functionality.

As done earlier, removing the git exclude is a basic recommended edit.

A more visible example is the order of HTML aggregation. For example, this 
website has its ```article_list_header.html``` coming before the tag list. The
article list header file includes the big "Articles" seen on the [index
page](https://blog.ayham.xyz), which comes before the tag list. To do this you can edit
the ```blog/index.html:``` section in the blogit script.

```make
...
blog/index.html: $(ARTICLES) $(TAGFILES) $(addprefix templates/,$(addsuffix .html,header index_header tag_list_header tag_entry tag_separator tag_list_footer article_list_header article_entry article_separator article_list_footer index_footer footer))
	mkdir -p blog
	TITLE="$(BLOG_TITLE)"; \
	export TITLE; \
	envsubst < templates/header.html > $@; \
	envsubst < templates/index_header.html >> $@; \
+	envsubst < templates/article_list_header.html >> $@; \
	envsubst < templates/tag_list_header.html >> $@; \
	first=true; \
	for t in $(shell cat $(TAGFILES) | sort -u); do \
		"$$first" || envsubst < templates/tag_separator.html; \
		NAME="$$t" \
		URL="@$$t.html" \
		envsubst < templates/tag_entry.html; \
		first=false; \
	done >> $@; \
	envsubst < templates/tag_list_footer.html >> $@; \
-	envsubst < templates/article_list_header.html >> $@; \
	first=true; \
	for f in $(ARTICLES); do \
...
```

## Fixing Code Blocks
I have noticed that when using backticks (`) to annotate a code block, blogit
would add an extra newline at the start of each code piece. To solve this issue,
ensure that you have the program command "markdown" which converts markdown to
HTML. After that, substitute as following:

```make
...
blog/%.html: $(BLOG_SRC)/%.md $(addprefix templates/,$(addsuffix .html,header article_header article_footer footer))
	mkdir -p blog
	TITLE="$(shell head -n1 $<)"; \
	export TITLE; \
	AUTHOR="$(shell git log -n 1 --reverse --format="%cn" -- "$<")"; \
	export AUTHOR; \
	DATE_POSTED="$(shell git log --diff-filter=A --date="format:$(BLOG_DATE_FORMAT)" --pretty=format:'%ad' -- "$<")"; \
	export DATE_POSTED; \
	DATE_EDITED="$(shell git log -n 1 --date="format:$(BLOG_DATE_FORMAT)" --pretty=format:'%ad' -- "$<")"; \
	export DATE_EDITED; \
	TAGS="$(shell grep -i '^; *tags:' "$<" | cut -d: -f2- | paste -sd ',')"; \
	export TAGS; \
	envsubst < templates/header.html > $@; \
	envsubst < templates/article_header.html >> $@; \
-		sed -e 1d \
-		-e '/^;/d' \
-		-e 's/&/\&amp;/g' \
-		-e 's/</\&lt;/g' \
-		-e 's/>/\&gt;/g' \
-		-e '/^```$$/{s,.*,,;x;p;/^<\/code>/d;s,.*,<pre><code>,;bT}' \
-		-e 'x;/<\/code>/{x;s,\$$,\&#36;,g;$$G;p;d};x' \
-		-e 's,\\\$$,\&#36;,g' \
-		-e '/^####/{s,^####,<h4>,;s,$$,</h4>,;H;s,.*,,;x;p;d}' \
-		-e '/^###/{s,^###,<h3>,;s,$$,</h3>,;H;s,.*,,;x;p;d}' \
-		-e '/^##/{s,^##,<h2>,;s,$$,</h2>,;H;s,.*,,;x;p;d}' \
-		-e '/^#/{s,^#,<h1>,;s,$$,</h1>,;H;s,.*,,;x;p;d}' \
-		-e 's,`\([^`]*\)`,<code>\1</code>,g' \
-		-e 's,\*\*\(\([^*<>][^*<>]*\*\?\)*\)\*\*,<b>\1</b>,g' \
-		-e 's,\*\([^*<>][^*<>]*\)\*,<i>\1</i>,g' \
-		-e 's,!\[\([^]]*\)\](\([^)]*\)),<img src="\2" alt="\1"/>,g' \
-		-e 's,\[\([^]]*\)\](\([^)]*\)),<a href="\2">\1</a>,g' \
-		-e '/^- /{s,^- ,<li>,;s,$$,</li>,;x;/^<\/ul>/{x;bL};p;s,.*,<ul>,;bT}' \
-		-e '/^[1-9][0-9]*\. /{s,^[0-9]*\. ,<li>,;s,$$,</li>,;x;/^<\/ol>/{x;bL};p;s,.*,<ol>,;bT}' \
-		-e '/^$$/{x;/^$$/d;p;d}' \
-		-e 'x;/^$$/{s,.*,<p>,;bT};x' \
-		-e ':L;$$G;p;d' \
-		-e ':T;p;:t;s,<\([^/>][^>]*\)>\(\(<[^/>][^>]*>\)*\),\2</\1>,;/<[^\/>]/bt;x;/^$$/{$${x;p};d};bL' \
-		"$<" | envsubst >> $@; \
+		sed -e 1d -e '/^;/d' < $< | markdown -f fencedcode >> $@; \
...
```

# Conclusion
[Go get a website](https://landchad.net), and set up blogit.
Want to contact me? [Here.](https://contact.ayham.xyz)
