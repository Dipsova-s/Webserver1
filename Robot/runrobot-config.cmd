::::::::::::::::::::::::::::::::::
:: specify host name
::::::::::::::::::::::::::::::::::
:: th-eatst01.theatst.org
:: th-eatst02.theatst.org
:: nl-eatst026.everyangle.org
:: localhost:xxxxx
set SERVER=nl-eatst026.everyangle.org

::::::::::::::::::::::::::::::::::
:: specify sub directory
::::::::::::::::::::::::::::::::::
:: sub10,sub20,sub30 or empty no sub directory
set BRANCH=release2017_acc

::::::::::::::::::::::::::::::::::
:: for perforance testing, it will use for compare between 2 servers
::::::::::::::::::::::::::::::::::
:: PREF_SERVER_CURRENT is a a current version you are using
:: PREF_SERVER_BASE is a version to compare with
:: PREF_SERVER_CURRENT performance should not decrease more than xx% compared to PREF_SERVER_BASE
set PREF_SERVER_CURRENT=http://th-weblb02.theatst.org:58102
set PREF_SERVER_BASE=http://th-weblb02.theatst.org:58112

::::::::::::::::::::::::::::::::::
:: specify test tag
::::::::::::::::::::::::::::::::::
:: allangles,audit,performance,smk_wc,acc_wc,smk_mc,acc_mc,test,intermittent
set TAG=allangles

::::::::::::::::::::::::::::::::::
:: specify a query for "allangles" tag
::::::::::::::::::::::::::::::::::
:: - empty means load all Angles, equal to "fq=facetcat_itemtype:(facet_angle facet_template)"
:: - url: http://host/branch/en/search/searchpage#/?sort=name&dir=&fq=facetcat_bp:(P2P S2D O2C F2R PM HCM)
::   a query -> sort=name&dir=&fq=facetcat_bp:(P2P S2D O2C F2R PM HCM)
set "QUERY="

::::::::::::::::::::::::::::::::::
:: specify path to copy test to other place, prevent command too long exception
::::::::::::::::::::::::::::::::::
:: - empty means no copy
set COPYTO=D:\Robot\