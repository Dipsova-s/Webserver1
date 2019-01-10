*** Settings ***
Resource            ${EXECDIR}/WC/POM/WebHelp/WebHelp.robot

*** Keywords ***
Crop Logo
    Crop WebHelp Image With Dimensions    wc_logo.png    css=#TopBar .Wrapper    15    0    180    44

Crop Business Processes
    Execute JavaScript    $('#SearchFacetBusinessProcesses .businessProcessesItem:not(.businessProcessesItemMore)').addClass('active');
    Crop WebHelp Image    wc_businessprocess.png    css=#SearchFacetBusinessProcesses .businessProcesses

Crop Panes Homepage
    Highlight WebHelp Element    css=#TopBar        text=1
    Highlight WebHelp Element    css=#LeftMenu      text=2
    Highlight WebHelp Element    css=#Content       text=3
    Crop WebHelp Image    wc_panes_homepage.png    css=#MainContainer
    Clear WebHelp Highlights

Crop Search Result
    Click Search Filter Angle
    Click Search Filter Template
    Click Search Filter Dashboard
    Wait Progress Bar Search Closed
    Wait Until Ajax Complete
    Crop WebHelp Image With Dimensions    wc_search_result.png    css=#MainContainer    191   54   1716    927

Crop Mode Button
    Execute JavaScript    $('#ViewType > a').removeClass('active');
    Crop WebHelp Image    wc_action_button_titles_only.png    css=#ShortList 
    Crop WebHelp Image    wc_action_button_full.png    css=#DisplaysList

Crop Action Button Sort
    Search By Text And Expect In Search Result     Batch
    Crop WebHelp Image    wc_action_button_sort_by.png   css=#SearchResultView .sortWrapper

Crop Show Display Button    
    Search By Text And Expect In Search Result     Batch
    Click Change View To Compact Mode

    ${left}    Execute JavaScript   return $('.ResultView').position().left+5;
    Crop WebHelp Image With Dimensions     wc_select_display_icon.png    css=#InnerResultWrapper .SearchResult    ${left}    2    40    34

Crop Item Icons
    Execute JavaScript    $('.SearchResult:first .SignFavoriteDisable,.SearchResult:first .SignFavorite').attr('class', 'SignFavorite').attr('style', 'width:22px;height:25px;background-position:center center;');
    Crop WebHelp Image   wc_starred.png   jquery=.SearchResult:first .SignFavorite

    Execute JavaScript    $('.SearchResult:first .ResultContent .rear .icon:eq(0)').attr('class', 'icon public');
    Crop WebHelp Image    wc_public.png   jquery=.SearchResult:first .ResultContent .rear .icon:eq(0)

    Execute JavaScript    $('.SearchResult:first .ResultContent .rear .icon:eq(0)').attr('class', 'icon private');
    Crop WebHelp Image    wc_private.png   jquery=.SearchResult:first .ResultContent .rear .icon:eq(0)

    Execute JavaScript    $('.SearchResult:first .ResultContent .rear .icon:eq(0)').attr('class', 'icon angle');
    Crop WebHelp Image    wc_angle_icon.png   jquery=.SearchResult:first .ResultContent .rear .icon:eq(0)

    Execute JavaScript    $('.SearchResult:first .ResultContent .rear .icon:eq(0)').attr('class', 'icon template');
    Crop WebHelp Image    wc_template.png   jquery=.SearchResult:first .ResultContent .rear .icon:eq(0)

    Execute JavaScript    $('.SearchResult:first .ResultContent .rear .icon:eq(0)').attr('class', 'icon parameterized');
    Crop WebHelp Image    wc_execution_lightning.png   jquery=.SearchResult:first .ResultContent .rear .icon:eq(0)

    Execute JavaScript    $('.SearchResult:first .ResultContent .rear .icon:eq(0)').attr('class', 'icon validated');
    Crop WebHelp Image    wc_validated.png   jquery=.SearchResult:first .ResultContent .rear .icon:eq(0)

    Execute JavaScript    $('.SearchResult:first .ResultContent .btnInfo').attr('style', 'width:22px;height:25px;');
    Crop WebHelp Image    wc_i_icon.png   jquery=.SearchResult:first .ResultContent .btnInfo

Crop Remove List Display Column
    Drag List Display Column To Drop Column Area    jquery=#AngleGrid [data-field="ObjectType"]
    Crop WebHelp Image With Dimensions  wc_drop.png  css=#MainContainer    0    0    1269    403
    Clear Dragging List Display Column