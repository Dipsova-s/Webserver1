*** Keywords ***
Screenshot "WC_How_to_filter_the_Angles" page
    Go to Search Page
    Crop Filter example
    Go to Search Page
    Crop Filter example2

Get Filter Example Dimensions
    ${dimensions}   Execute JavaScript
    ...   var getBoxHeight = function(selector) { return $(selector).map(function(){ return $(this).parent().height()+15; }).get().sum(); };
    ...   var width = $('#LeftMenu').width();
    ...   var height = getBoxHeight('#facetcat_itemtype_Checkbox,#facetcat_characteristics_Checkbox,#facetcat_models_Checkbox,#facetcat_admin_Checkbox');
    ...   var top = getBoxHeight('#facetcat_bp') + 57;
    ...   return [0, top, width, height];
    [Return]   ${dimensions}

Crop Filter example
    Select Search Filter Angle
    Click Search Filter Is Validated

    ${dimensions}   Get Filter Example Dimensions
    Crop WebHelp Image With Dimensions        WC_Filter_example.png     css=#LeftMenu    @{dimensions}[0]    @{dimensions}[1]    @{dimensions}[2]    @{dimensions}[3]

Crop Filter example2
    Select Search Filter Angle
    Click Search Filter Is Private
    Click Search Filter Is Validated

    ${dimensions}   Get Filter Example Dimensions
    Crop WebHelp Image With Dimensions        WC_Filter_example2.png     css=#LeftMenu    @{dimensions}[0]    @{dimensions}[1]    @{dimensions}[2]    @{dimensions}[3]