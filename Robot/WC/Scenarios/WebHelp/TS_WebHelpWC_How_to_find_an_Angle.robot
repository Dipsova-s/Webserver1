*** Keywords ***
Screenshot "WC_How_to_find_an_Angle" page
    Go to Search Page

    Select Search Filter Angle
    Crop Filter Angle Tag

Crop Filter Angle Tag
    Crop WebHelp Image With Dimensions  WC_Filter_tag.png  css=#facetcat_itemtype_Checkbox  10  9  115  22
