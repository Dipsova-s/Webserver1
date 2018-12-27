::::::::::::::::::::::::::::::::::
:: specify host name
::::::::::::::::::::::::::::::::::
:: nl-webmb01.everyangle.org
:: nl-eatst026.everyangle.org
:: localhost:xxxxx
set SERVER=nl-webmb01.everyangle.org

::::::::::::::::::::::::::::::::::
:: specify sub directory
::::::::::::::::::::::::::::::::::
:: sub10,sub20,sub30 or empty no sub directory
set BRANCH=master

::::::::::::::::::::::::::::::::::
:: for perforance testing, it will use for compare between 2 servers
::::::::::::::::::::::::::::::::::
:: BRANCH performance should not decrease more than xx% compared to COMPARE_BRANCH
set COMPARE_BRANCH=master

::::::::::::::::::::::::::::::::::
:: specify test tag
::::::::::::::::::::::::::::::::::
:: allangles,performance,audit,smk_wc,acc_wc,smk_mc,acc_mc,intermittent,webhelp,webhelp_wc,webhelp_mc
set TAG=allangles

::::::::::::::::::::::::::::::::::
:: specify webhelp languages
::::::::::::::::::::::::::::::::::
:: en,nl,de,es,fr
set LANGUAGES=en

::::::::::::::::::::::::::::::::::
:: specify a query for "allangles" tag
::::::::::::::::::::::::::::::::::
:: - empty means load all Angles, equal to "fq=facetcat_itemtype:(facet_angle facet_template)"
:: - url: http://host/branch/en/search/searchpage#/?sort=name&dir=&fq=facetcat_bp:(P2P S2D O2C F2R PM HCM)
::   a query -> sort=name&dir=&fq=facetcat_bp:(P2P S2D O2C F2R PM HCM)
set "QUERY=fq=facetcat_itemtype:(facet_angle facet_template)"

::::::::::::::::::::::::::::::::::
:: specify path to copy test to other place, prevent command too long exception
::::::::::::::::::::::::::::::::::
:: - empty means no copy
set COPYTO=D:\Robot\