*** Settings ***
Resource    		${EXECDIR}/WC/POM/Search/SearchPage.robot
Resource    		${EXECDIR}/WC/POM/Angle/AnglePage.robot
Resource            ${EXECDIR}/WC/POM/Angle/FieldSettings.FieldFormatsPopup.Robot

*** Keywords ***
Verify Field Setting All Format
    Verfiy Field Format In Row Area: Enum
    Verfiy Field Format In Row Area: Text
    Verfiy Field Format In Row Area: YesNo
    Verfiy Field Format In Row Area: Time
    Verfiy Field Format In Row Area: Datetime
    Verfiy Field Format In Column Area: Currency
    Verfiy Field Format In Column Area: Date
    Verfiy Field Format In Column Area: Number
    Verfiy Field Format In Column Area: Percentage
    Verfiy Field Format In Column Area: Period
    Verfiy Field Format In Data Area: Count
    Verfiy Field Format In Data Area: Currency
    Verfiy Field Format In Data Area: Number
    Verfiy Field Format In Data Area: Percantage
    Verfiy Field Format In Data Area: Period

Verfiy Field Format In Row Area: Enum
    Click Field In Row Area By Field Index    0
    Click Show Field Format For Field Settings
    ${bucketHaveLast2Character}    Dropdown Contain Option    ${optionBucketOption}    Last 2 characters
    Should Not Be True    ${bucketHaveLast2Character}
    Select Bucket Option    Individual
    Element Should Be Visible    ${ddlBucketFormat}
    Select Bucket Format    Use default
    Select Bucket Format    Short name (Long name)
    Select Bucket Option    First 2 characters
    Element Should Not Be Visible    ${ddlBucketFormat}
    Save Field Format

Verfiy Field Format In Row Area: Text
    Click Field In Row Area By Field Index    1
    Click Show Field Format For Field Settings
    Select Bucket Option    Individual
    Select Bucket Option    First 2 characters
    Select Bucket Option    Last 2 characters
    Save Field Format

Verfiy Field Format In Row Area: YesNo
    Click Field In Row Area By Field Index    2
    Click Show Field Format For Field Settings
    Select Bucket Option    Individual
    Save Field Format

Verfiy Field Format In Row Area: Time
    Click Field In Row Area By Field Index    3
    Click Show Field Format For Field Settings
    Select Bucket Option    Per hour
    Select Second Format    Use default
    Select Second Format    None
    Select Second Format    ss
    Save Field Format

Verfiy Field Format In Row Area: Datetime
    Click Field In Row Area By Field Index    4
    Verify Field Format For Period Date Datetime

Verfiy Field Format In Column Area: Currency
    Click Field In Column Area By Field Index    0
    Verify Field Format For Number Currency Percentage In Row And Column Area

Verfiy Field Format In Column Area: Date
    Click Field In Column Area By Field Index    1
    Verify Field Format For Period Date Datetime

Verfiy Field Format In Column Area: Number
    Click Field In Column Area By Field Index    2
    Verify Field Format For Number Currency Percentage In Row And Column Area

Verfiy Field Format In Column Area: Percentage
    Click Field In Column Area By Field Index    3
    Verify Field Format For Number Currency Percentage In Row And Column Area

Verfiy Field Format In Column Area: Period
    Click Field In Column Area By Field Index    4
    Verify Field Format For Period Date Datetime

Verfiy Field Format In Data Area: Count
    Click Field In Data Area By Field Index     0
    Click Show Count Field Format For Field Settings
    Select Display Unit    Use default
    Select Display Unit    None
    Select Display Unit    Thousands (K)
    Select Display Unit    Millions (M)
    Save Field Format

Verfiy Field Format In Data Area: Currency
    Click Field In Data Area By Field Index     1
    Verify Field Format For Number(Double) Currency Percentage In Data Area

Verfiy Field Format In Data Area: Number
    Click Field In Data Area By Field Index     2
    Verify Field Format For Number(Integer) And Set In Data Area

Verfiy Field Format In Data Area: Percantage
    Click Field In Data Area By Field Index     3
    Verify Field Format For Number(Double) Currency Percentage In Data Area

Verfiy Field Format In Data Area: Period
    Click Field In Data Area By Field Index     4
    Verify Field Format For Number(Integer) And Set In Data Area


Verify Field Format For Number Currency Percentage In Row And Column Area
    Click Show Field Format For Field Settings
    Select Bucket Option    1
    ${displayUnitThousand}    Dropdown Contain Option    ${optionDisplayUnit}    Thousands (K)
    Should Not Be True    ${displayUnitThousand}
    Select Bucket Option    1,000
    Select Display Unit    Use default
    Select Display Unit    None
    Select Display Unit    Thousands (K)
    ${displayUnitMillions}    Dropdown Contain Option    ${optionDisplayUnit}    Millions (M)
    Should Not Be True    ${displayUnitMillions}
    Select Bucket Option    1,000,000
    ${displayUnitMillions}    Dropdown Contain Option    ${optionDisplayUnit}    Millions (M)
    Should Be True    ${displayUnitMillions}
    Select Bucket Decimal    Use default
    Select Bucket Decimal    None
    Select Bucket Decimal    6
    Page Should Contain Element    ${chkUseBucketThousandSeperate}
    Save Field Format

Verify Field Format For Period Date Datetime
    Click Show Field Format For Field Settings
    Select Bucket Option    Per day
    Select Bucket Option    Per quarter
    Select Bucket Option    Per year
    Save Field Format

Verify Field Format For Number(Double) Currency Percentage In Data Area
    Click Show Field Format For Field Settings
    Select Bucket Option    Min
    Select Bucket Option    Sum
    Select Bucket Option    Average
    Select Display Unit    Use default
    Select Display Unit    None
    Select Display Unit    Millions (M)
    Select Bucket Decimal    Use default
    Select Bucket Decimal    None
    Select Bucket Decimal    6
    Save Field Format

Verify Field Format For Number(Integer) And Set In Data Area
    Click Show Field Format For Field Settings
    Select Bucket Option    Min
    Select Bucket Option    Sum
    Select Bucket Option    Average
    Select Bucket Decimal    Use default
    Select Bucket Decimal    None
    Select Bucket Decimal    6
    Select Bucket Option    Max
    Element Should Not Be Visible    ${ddlBucketDecimal}
    Select Display Unit    Use default
    Select Display Unit    None
    Select Display Unit    Millions (M)
    Save Field Format