*** Keywords ***
Screenshot "WC_Business_process_bar" page
    Go to Search Page
    Crop Business Processes

Crop Business Processes
    Crop WebHelp Image    WC_business_process_filters.png    css=#facetcat_bp_Checkbox
