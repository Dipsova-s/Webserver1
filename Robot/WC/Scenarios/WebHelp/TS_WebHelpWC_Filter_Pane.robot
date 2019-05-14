*** Keywords ***
Screenshot "WC_Filter_Pane" page
    Go to Search Page

    Crop Business Process Filters

    Crop Item Type Filters
    Crop Characteristic Filters

    # collapse bp + general panel then expand additional filters
    Click Search Business Process S2D
    Collapse Search Filter "Business Processes" Panel
    Collapse Search Filter "General" Panel
    Expand Search Filter "Angle type" Panel
    Expand Search Filter "Angle purpose" Panel
    Crop Additional Filters
    Collapse Search Filter "Angle type" Panel
    Collapse Search Filter "Angle purpose" Panel
    Expand Search Filter "Business Processes" Panel
    Expand Search Filter "General" Panel

Crop Business Process Filters
    Crop WebHelp Image    WC_P2P_Icon.png    jquery=#facetcat_bp_Checkbox .label[alt="P2P"]    ${False}
    Crop WebHelp Image    WC_S2D_Icon.png    jquery=#facetcat_bp_Checkbox .label[alt="S2D"]    ${False}
    Crop WebHelp Image    WC_O2C_Icon.png    jquery=#facetcat_bp_Checkbox .label[alt="O2C"]    ${False}
    Crop WebHelp Image    WC_F2R_Icon.png    jquery=#facetcat_bp_Checkbox .label[alt="F2R"]    ${False}
    Crop WebHelp Image    WC_PM_Icon.png     jquery=#facetcat_bp_Checkbox .label[alt="PM"]     ${False}
    Crop WebHelp Image    WC_HCM_Icon.png    jquery=#facetcat_bp_Checkbox .label[alt="HCM"]    ${False}
    Crop WebHelp Image    WC_GRC_Icon.png    jquery=#facetcat_bp_Checkbox .label[alt="GRC"]    ${False}
    Crop WebHelp Image    WC_IT_Icon.png     jquery=#facetcat_bp_Checkbox .label[alt="IT"]     ${False}

Crop Item Type Filters
    ${sizes}   Execute JavaScript
    ...     return [
    ...         $('.label[alt="facet_angle"]').width() + 2,
    ...         $('.label[alt="facet_template"]').width() + 2,
    ...         $('.label[alt="facet_dashboard"]').width() + 2,
    ...     ];
    Crop WebHelp Image With Dimensions  WC_EA_filter.png  css=#facetcat_itemtype_Checkbox  34  9  @{sizes}[0]  20  ${False}
    Crop WebHelp Image With Dimensions  WC_Template_filter.png  css=#facetcat_itemtype_Checkbox  34  34  @{sizes}[1]  20  ${False}
    Crop WebHelp Image With Dimensions  WC_Dashboard_filter.png  css=#facetcat_itemtype_Checkbox  34  59  @{sizes}[2]  20  ${False}

Crop Characteristic Filters
    Execute JavaScript    $('#with_private_display').closest('li').show();
    ${sizes}   Execute JavaScript
    ...     return [
    ...         $('.label[alt="facet_isprivate"]').width() + 2,
    ...         $('.label[alt="with_private_display"]').width() + 2,
    ...         $('.label[alt="facet_isvalidated"]').width() + 2,
    ...         $('.label[alt="facet_isstarred"]').width() + 2
    ...     ];
    Crop WebHelp Image With Dimensions  WC_Private_filter.png  css=#facetcat_characteristics_Checkbox  34  9  @{sizes}[0]  20
    Crop WebHelp Image With Dimensions  WC_private_display.png  css=#facetcat_characteristics_Checkbox  34  34  @{sizes}[1]  20
    Crop WebHelp Image With Dimensions  WC_Validated_filter.png  css=#facetcat_characteristics_Checkbox  34  59  @{sizes}[2]  20
    Crop WebHelp Image With Dimensions  WC_Starred_filter.png  css=#facetcat_characteristics_Checkbox  34  84  @{sizes}[3]  20

Crop Additional Filters
    ${widthFilters}   ${heightFilters}      Get Element Size    css=#LeftMenu .facetFilter
    ${widthHeader}    ${heightHeader}       Get Element Size    css=#facetcat_bp
    ${heightHidden}      Execute JavaScript    return ${heightHeader}*2;
    ${height}    Execute JavaScript    return ${heightFilters}-${heightHidden};
    Crop WebHelp Image With Dimensions  WC_Additional_filter.png  css=#LeftMenu .facetFilter  0  ${heightHidden}  ${widthFilters}  ${height}