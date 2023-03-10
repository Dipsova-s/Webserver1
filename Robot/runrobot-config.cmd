::::::::::::::::::::::::::::::::::
:: specify host name
::::::::::::::::::::::::::::::::::
:: nl-web2020-2.eatestad.local
:: localhost:xxxxx
set SERVER=nl-cqamb04.everyangle.org

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
:: allangles,performance,audit,smk_wc,acc_wc,smk_mc,acc_mc
:: webhelp_setup,webhelp,webhelp_wc,webhelp_mc,webhelp_import,webhelp_export
set TAG=allangles

::::::::::::::::::::::::::::::::::
:: silence mode
::::::::::::::::::::::::::::::::::
:: TestServer runs in a silence mode by default
set SILENCE=0

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
set COPYTO=