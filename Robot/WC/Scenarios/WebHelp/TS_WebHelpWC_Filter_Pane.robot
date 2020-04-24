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
    ${sizes}   Execute JavaScript
    ...     return [
    ...         $('.label[alt="P2P"] .BusinessProcessBadgeLabel').width() + 25,
    ...         $('.label[alt="S2D"] .BusinessProcessBadgeLabel').width() + 25,
    ...         $('.label[alt="O2C"] .BusinessProcessBadgeLabel').width() + 25,
    ...         $('.label[alt="F2R"] .BusinessProcessBadgeLabel').width() + 25,
    ...         $('.label[alt="PM"] .BusinessProcessBadgeLabel').width() + 25,
    ...         $('.label[alt="QM"] .BusinessProcessBadgeLabel').width() + 25,
    ...         $('.label[alt="HCM"] .BusinessProcessBadgeLabel').width() + 25,
    ...         $('.label[alt="GRC"] .BusinessProcessBadgeLabel').width() + 25,
    ...         $('.label[alt="IT"] .BusinessProcessBadgeLabel').width() + 25
    ...     ];
    Crop WebHelp Image With Dimensions    WC_P2P_Icon.png    jquery=#facetcat_bp_Checkbox .label[alt="P2P"]  30  0  @{sizes}[0]  17  ${False}
    Crop WebHelp Image With Dimensions    WC_S2D_Icon.png    jquery=#facetcat_bp_Checkbox .label[alt="S2D"]  30  0  @{sizes}[1]  17  ${False}
    Crop WebHelp Image With Dimensions    WC_O2C_Icon.png    jquery=#facetcat_bp_Checkbox .label[alt="O2C"]  30  0  @{sizes}[2]  17  ${False}
    Crop WebHelp Image With Dimensions    WC_F2R_Icon.png    jquery=#facetcat_bp_Checkbox .label[alt="F2R"]  30  0  @{sizes}[3]  17  ${False}
    Crop WebHelp Image With Dimensions    WC_PM_Icon.png     jquery=#facetcat_bp_Checkbox .label[alt="PM"]   30  0  @{sizes}[4]  17  ${False}
    Crop WebHelp Image With Dimensions    WC_QM_Icon.png     jquery=#facetcat_bp_Checkbox .label[alt="QM"]   30  0  @{sizes}[5]  17  ${False}
    Crop WebHelp Image With Dimensions    WC_HCM_Icon.png    jquery=#facetcat_bp_Checkbox .label[alt="HCM"]  30  0  @{sizes}[6]  17  ${False}
    Crop WebHelp Image With Dimensions    WC_GRC_Icon.png    jquery=#facetcat_bp_Checkbox .label[alt="GRC"]  30  0  @{sizes}[7]  17  ${False}
    Crop WebHelp Image With Dimensions    WC_IT_Icon.png     jquery=#facetcat_bp_Checkbox .label[alt="IT"]   30  0  @{sizes}[8]  17  ${False}

Crop Item Type Filters
    ${sizes}   Execute JavaScript
    ...     return [
    ...         $('.label[alt="facet_angle"] .filter-name').width() + 25,
    ...         $('.label[alt="facet_template"] .filter-name').width() + 25,
    ...         $('.label[alt="facet_dashboard"] .filter-name').width() + 25,
    ...     ];
    Crop WebHelp Image With Dimensions  WC_EA_filter.png  css=#facetcat_itemtype_Checkbox  30  12  @{sizes}[0]  20  ${False}
    Crop WebHelp Image With Dimensions  WC_Template_filter.png  css=#facetcat_itemtype_Checkbox  30  42  @{sizes}[1]  20  ${False}
    Crop WebHelp Image With Dimensions  WC_Dashboard_filter.png  css=#facetcat_itemtype_Checkbox  30  72  @{sizes}[2]  20  ${False}

Crop Characteristic Filters
    Execute JavaScript    $('#with_private_display').closest('li').show();
    Execute JavaScript    $('#facet_has_warnings').closest('li').show();
    ${sizes}   Execute JavaScript
    ...     return [
    ...         $('.label[alt="facet_isprivate"] .filter-name').width() + 25,
    ...         $('.label[alt="with_private_display"] .filter-name').width() + 25,
    ...         $('.label[alt="facet_isvalidated"] .filter-name').width() + 25,
    ...         $('.label[alt="facet_has_warnings"] .filter-name').width() + 25,
    ...         $('.label[alt="facet_isstarred"] .filter-name').width() + 25
    ...     ];
    Crop WebHelp Image With Dimensions  WC_Private_filter.png  css=#facetcat_characteristics_Checkbox  30  0  @{sizes}[0]  20
    Crop WebHelp Image With Dimensions  WC_private_display.png  css=#facetcat_characteristics_Checkbox  30  26  @{sizes}[1]  20
    Crop WebHelp Image With Dimensions  WC_Validated_filter.png  css=#facetcat_characteristics_Checkbox  30  56  @{sizes}[2]  20
    Crop WebHelp Image With Dimensions  WC_Warning_filter.png  css=#facetcat_characteristics_Checkbox  30  86  @{sizes}[3]  20
    Crop WebHelp Image With Dimensions  WC_Starred_filter.png  css=#facetcat_characteristics_Checkbox  30  114  @{sizes}[3]  20

Crop Additional Filters
    ${widthFilters}   ${heightFilters}      Get Element Size    css=#LeftMenu .facetFilter
    ${widthHeader}    ${heightHeader}       Get Element Size    css=#facetcat_bp
    ${heightHidden}      Execute JavaScript    return ${heightHeader} * 2;
    ${height}    Execute JavaScript    return ${heightFilters} + 15 - ${heightHidden};
    Crop WebHelp Image With Dimensions  WC_Additional_filter.png  css=#LeftMenu  0  ${heightHidden + 60}  ${widthFilters + 40}  ${height}