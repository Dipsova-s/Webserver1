using Newtonsoft.Json;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace EveryAngle.Core.ViewModels.Users
{
    public class UserSettingsViewModel
    {
        public string client_settings { get; set; }

        [LocalizedDisplayName("MC_DecimalSeparator")]
        public string general_decimal_seperator { get; set; }

        [LocalizedDisplayName("MC_ThousandSeparator")]
        public string general_thousand_seperator { get; set; }

        [LocalizedDisplayName("MC_DefaultSettingLanguage")]
        public string default_language { get; set; }

        [LocalizedDisplayName("MC_DefaultSettingCurrency")]
        public string default_currency { get; set; }

        public int default_decimal_places { get; set; }

        public string format_numbers { get; set; }

        public FormatViewModel format_numbers_model { get; set; }

        public string format_currencies { get; set; }

        public FormatViewModel format_currencies_model { get; set; }

        public string format_percentages { get; set; }

        public FormatViewModel format_percentages_model { get; set; }

        [LocalizedDisplayName("MC_DefaultSettingExportLines")]
        public int default_export_lines { get; set; }

        [LocalizedDisplayName("MC_SAPFieldsChooser")]
        public bool sap_fields_in_chooser { get; set; }

        [LocalizedDisplayName("MC_SAPFieldsHeader")]
        public bool sap_fields_in_header { get; set; }

        [LocalizedDisplayName("MC_CompressedListHeader")]
        public bool compressed_list_header { get; set; }
        
        [LocalizedDisplayName("MC_DefaultSettingBusinessProcesses")]
        public List<string> default_business_processes { get; set; }

        [LocalizedDisplayName("MC_AutoExecuteItemsLogin")]
        public bool auto_execute_items_on_login { get; set; }

        [LocalizedDisplayName("MC_DefaultSettingSet")]
        public string format_enum { get; set; }

        public FormatDateViewModel format_date_model { get; set; }

        public string format_date { get; set; }

        [LocalizedDisplayName("MC_DefaultSettingPeriod")]
        public string format_period { get; set; }

        public FormatTimeViewModel format_time_model { get; set; }

        public string format_time { get; set; }

        [LocalizedDisplayName("MC_FormatLocale")]
        public string format_locale { get; set; }

        [LocalizedDisplayName("MC_DefaultStarredFields")]
        public bool default_Starred_Fields { get; set; }

        [LocalizedDisplayName("MC_DefaultSuggestedFields")]
        public bool default_Suggested_Fields { get; set; }

        private bool IsDefaultStarredFields()
        {
            dynamic cliendSettings = JsonConvert.DeserializeObject(this.client_settings);
            return cliendSettings.default_Starred_Fields ?? false;
        }

        private bool IsDefaultSuggestedFields()
        {
            dynamic cliendSettings = JsonConvert.DeserializeObject(this.client_settings);
            return cliendSettings.default_Suggested_Fields ?? false;
        }

        public void LoadClientSettings()
        {
            default_Starred_Fields = IsDefaultStarredFields();
            default_Suggested_Fields = IsDefaultSuggestedFields();
            general_decimal_seperator = GetClientSettingBy("general_decimal_seperator") ?? ".";
            general_thousand_seperator = GetClientSettingBy("general_thousand_seperator") ?? ",";
        }

        public string GetClientSettingBy(string name)
        {
            if (client_settings != null)
            {
                dynamic cliendSettings = JsonConvert.DeserializeObject(client_settings);
                return cliendSettings[name];
            }
            else return null;
        }

        public object Clone()
        {
            return MemberwiseClone();
        }
    }

    public class FormatDateViewModel
    {        
        [JsonProperty(PropertyName = "order")]
        [LocalizedDisplayName("MC_DateOrder")]
        public string date_order { get; set; }

        [JsonProperty(PropertyName = "day")]
        [LocalizedDisplayName("MC_DayFormat")]
        public string date_day { get; set; }

        [JsonProperty(PropertyName = "month")]
        [LocalizedDisplayName("MC_MonthFormat")]
        public string date_month { get; set; }


        [JsonProperty(PropertyName = "year")]
        [LocalizedDisplayName("MC_YearFormat")]
        public string date_year { get; set; }

        [JsonProperty(PropertyName = "separator")]
        [LocalizedDisplayName("MC_DateSeparator")]
        public string date_separator { get; set; }
    }

    public class FormatTimeViewModel
    {
        [JsonProperty(PropertyName = "hour")]
        [LocalizedDisplayName("MC_TimeFormat")]
        public string hour { get; set; }

        [JsonProperty(PropertyName = "second")]
        [LocalizedDisplayName("MC_TimeFormat")]
        public string second { get; set; }

        [JsonProperty(PropertyName = "separator")]
        [LocalizedDisplayName("MC_TimeSeparator")]
        public string separator { get; set; }

    }

    public class FormatViewModel
    {
        [JsonProperty(PropertyName = "decimals")]
        public int decimals { get; set; }

        [JsonProperty(PropertyName = "prefix")]
        public string prefix { get; set; }

        [JsonProperty(PropertyName = "thousandseparator")]
        public bool thousandseparator { get; set; }
    }
}

