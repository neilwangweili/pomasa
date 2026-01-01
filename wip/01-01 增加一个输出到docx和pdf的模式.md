我要在POMASA里增加一个模式，大概意思就是结果报告输出到docx和pdf，你想想叫什么名字。

这应该是一个“推荐”级别的模式，不是必须。但是generator在生成的时候应该缺省把它用上，因为确实很好用。

有这么几个要素：

* 最终报告应该输出成pdf和docx两种格式

* 输出的路径应该是MAS的主目录（而不是`data/`子目录）下的`_output`目录——是不是要git ignore这个路径，由用户自己判断，POMASA不强制，只是说可以有这么一个考虑

* 输出的方式应该是用脚本工具来输出，比如最常用的pandoc
    - 我觉得是不是MAS的主目录下应该有一个`scripts`目录，以后潜在有这些确定用途的脚本都放这里

* 格式控制：
    - 输出成docx的情况：我一般常用的字体是英文Cochin、中文宋体，还有一堆具体的格式设置。推荐的做法是用户提供一个docx文件作为模板。我们附送一个作为参考：`references/docx-template.docx`。你看看怎么使用。我觉得generator（如果使用这个模式的话）可以把这个文件给用户copy过去。
    - 输出成pdf的情况：要考虑多语言，至少得支持中文。我一般会配合pandoc使用xelatex，并且提供一个latex-header.tex来控制格式。我也做了一个这个文件的模板在`references/latex-header.tex`，也可以跟上面说的docx-template一样处理。

* 报告的文件名应该跟着报告的标题走，并且加上时间戳。比如说报告的完整标题叫“Innovative AI-Assisted Systems for Social Science Research: Architecture Design and Applied Practice”，那么文件名就应该叫`Innovative AI-Assisted Systems for Social Science Research [20260101-093510].docx`之类的。
    - 这里有个很tricky的事：建MAS的时候因为还没有做研究，很可能是不知道最终文章写成什么样的，也不知道是什么标题，所以这个脚本，要么是等到final-report生成完以后才建，要么先建的话就要把final-report的标题作为参数传入
    - 并且要注意：如果final-report的标题里有不能用于文件名的字符，要转成`-`字符

我想到的大概就这些，你看看还有什么遗漏或问题。