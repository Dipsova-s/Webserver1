*** Keywords ***
Screenshot "WC_How_to_filter_the_Angles" page
    Go to Search Page
    Crop Filter example
    Go to Search Page
    Crop Filter example2

Crop Filter example
    Select Search Filter Angle
    Click Search Filter Is Validated

    ${width1}   ${height1}      Get Element Size    css=#facetcat_itemtype
    ${width2}   ${height2}      Get Element Size    css=#facetcat_itemtype_Checkbox
    ${width3}   ${height3}      Get Element Size    css=#facetcat_characteristics_Checkbox
    ${width4}   ${height4}      Get Element Size    css=#facetcat_models_Checkbox
    ${width5}   ${height5}      Get Element Size    css=#facetcat_admin_Checkbox
    ${height}    Execute javascript    return ${height1}+${height2}+${height3}+${height4}+${height5}
    Crop WebHelp Image With Dimensions        WC_Filter_example.png     css=#LeftMenu .facetFilter    0    258    193    ${height}

Crop Filter example2
    Select Search Filter Angle
    Click Search Filter Is Private
    Click Search Filter Is Validated

    ${width1}   ${height1}      Get Element Size    css=#facetcat_itemtype
    ${width2}   ${height2}      Get Element Size    css=#facetcat_itemtype_Checkbox
    ${width3}   ${height3}      Get Element Size    css=#facetcat_characteristics_Checkbox
    ${width4}   ${height4}      Get Element Size    css=#facetcat_models_Checkbox
    ${width5}   ${height5}      Get Element Size    css=#facetcat_admin_Checkbox
    ${height}    Execute javascript    return ${height1}+${height2}+${height3}+${height4}+${height5}
    Crop WebHelp Image With Dimensions        WC_Filter_example2.png     css=#LeftMenu .facetFilter    0    258    193    ${height}