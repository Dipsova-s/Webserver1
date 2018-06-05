using EveryAngle.Core.ViewModels.Users;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Threading;
using System.Web;

namespace EveryAngle.WebClient.Web.Helpers
{
    public static class LocalizationHelper
    {
        public static void SetCultureFormat(string numberDecimalSeparator, string numberGroupSeparator)
        {
            //Get current culture 
            string sCurrentCulture = System.Threading.Thread.CurrentThread.CurrentCulture.Name;
            CultureInfo ci;

            //Set to symbol for
            ci = new CultureInfo(sCurrentCulture);
            ci.NumberFormat.NumberDecimalSeparator = numberDecimalSeparator;
            ci.NumberFormat.PercentDecimalSeparator = numberDecimalSeparator;
            ci.NumberFormat.CurrencyDecimalSeparator = numberDecimalSeparator;

            ci.NumberFormat.NumberGroupSeparator = numberGroupSeparator;
            ci.NumberFormat.PercentGroupSeparator = numberGroupSeparator;
            ci.NumberFormat.CurrencyGroupSeparator = numberGroupSeparator;

            ci.DateTimeFormat.AMDesignator = ci.DateTimeFormat.AMDesignator.ToLower();
            ci.DateTimeFormat.PMDesignator = ci.DateTimeFormat.PMDesignator.ToLower();

            Thread.CurrentThread.CurrentCulture = ci;
            Thread.CurrentThread.CurrentUICulture = ci;
            CultureInfo.DefaultThreadCurrentCulture = ci;
            CultureInfo.DefaultThreadCurrentUICulture = ci;
        }

        public static void SetCultureFormatBy(UserSettingsViewModel userSettingsViewModel)
        {
            string numberDecimalSeparator = ".";
            string numberGroupSeparator = ",";

            if (userSettingsViewModel != null)
            {
                if (userSettingsViewModel.GetClientSettingBy("general_decimal_seperator") != null)
                {
                    numberDecimalSeparator = userSettingsViewModel.GetClientSettingBy("general_decimal_seperator");
                }
                if (userSettingsViewModel.GetClientSettingBy("general_thousand_seperator") != null)
                {
                    numberGroupSeparator = userSettingsViewModel.GetClientSettingBy("general_thousand_seperator");
                }
            }

            SetCultureFormat(numberDecimalSeparator, numberGroupSeparator);
        }


    }
}
