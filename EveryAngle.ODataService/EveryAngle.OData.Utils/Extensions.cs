using EveryAngle.OData.DTO;
using EveryAngle.OData.Utils.Constants;
using System;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.Diagnostics;
using System.Linq;
using System.Net.Http.Headers;
using System.Reflection;
using System.Text;
using System.Text.RegularExpressions;

namespace EveryAngle.OData.Utils
{
    public static class Extensions
    {
        #region utilities

        public static string Truncate(this string value, int maxLength)
        {
            if (string.IsNullOrEmpty(value)) return value;
            return value.Length <= maxLength ? value : value.Substring(0, maxLength);
        }

        public static T As<T>(this object obj)
        {
            return (T)Convert.ChangeType(obj, typeof(T));
        }

        public static int IdFromUri(this string uri)
        {
            return int.Parse(uri.Split('/').Last());
        }

        public static string CleanId(this string idstring)
        {
            return idstring.Contains("__") ? idstring.Split(new string[] { "__" }, StringSplitOptions.RemoveEmptyEntries).Last() : idstring;
        }

        public static string EntitySetId(this string entitySetName)
        {
            return entitySetName.Split(new string[] { "__" }, StringSplitOptions.None).Last();
        }

        public static string GetNullValueText(this object nullObject)
        {
            if (nullObject != null)
                return nullObject.ToString();

            return "<no value> (<no value>)";
        }

        public static T GetQueryArgs<T>(this NameValueCollection queryString, string key)
        {
            if (queryString.HasKeys())
                return queryString[key].As<T>();

            return default(T);
        }

        public static string Replace(this string text, char[] oldChars, char newChar)
        {
            return String.Join(newChar.ToString(), text.Split(oldChars));
        }

        public static string AsXMLElementName(this Field field)
        {
            string[] splittedUri = field.uri.Split('/');
            string internalId = splittedUri.GetValue(splittedUri.Length - 1).ToString();
            return AsXMLElementName(Regex.IsMatch(field.id, "^[a-zA-Z0-9_]*$") ?
                                    field.id :
                                    string.Format("{0}_{1}", field.id, internalId));
        }

        public static string AsXMLElementName(this string text)
        {
            if (string.IsNullOrEmpty(text))
                return text;
            //Element names are case-sensitive
            //Element names must start with a letter or underscore
            //Element names cannot start with the letters xml(or XML, or Xml, etc)
            //Element names can contain letters, digits, hyphens, underscores, and periods
            //Element names cannot contain spaces
            //Avoid "-".If you name something "first-name", some software may think you want to subtract "name" from "first".
            //Avoid ".".If you name something "first.name", some software may think that "name" is a property of the object "first".
            //Avoid ":".Colons are reserved for namespaces(more later).

            // replace all special character to "_"
            string elementName = Regex.Replace(text, @"[^0-9a-zA-Z_]+", "_");

            // xml element does not allow the element which is started by "xml", replace to "_"
            if (elementName.ToLower().StartsWith("xml"))
                elementName = "_" + elementName;

            return elementName;
        }

        public static string UniqueEntityName(this Display display)
        {
            // Make sure the angle has an unique id by adding the model:angle:display id's as suffix
            string[] uriParts = display.uri.Split('/');
            string uniqueId = string.Format("{0}{1}_{2}_{3}", display.display_type.ToUpper().FirstOrDefault(), uriParts[2], uriParts[4], uriParts[6]);
            
            // The max length of the identifier is 128 minus the separators "[][]_" minus the length of the model:angle:display id's
            int maxLen = 128 - 4 - uniqueId.Length;

            string angleName = display.AngleName.Trim();
            string displayName = display.name.Trim();
            
            // When a concatenation of [anglename][displayname]_model:angle:display id is too long, shorten it
            if (angleName.Length + displayName.Length > maxLen)
            {
                // shorten angle name, keep a minimum of 20 chars
                int angleNameMaxLen = Math.Max(20, Math.Min(angleName.Length, maxLen - displayName.Length - 2));
                if (angleName.Length > angleNameMaxLen + 2)
                {
                    angleName = angleName.Substring(0, angleNameMaxLen).TrimEnd();
                }

                // Shorten the display name to the remaining available space
                int displayNameMaxLen = maxLen - angleName.Length;
                if (displayName.Length > displayNameMaxLen)
                {
                    displayName = displayName.Substring(0, displayNameMaxLen - 2).Trim();
                }
            }

            // maybe validate with regex later
            string result = string.Format("{0}_{1}_{2}", angleName, displayName, uniqueId)
                                  .Replace(" .+/?%#()&<>:*\\,\"{}$!@฿^';=[]-|".ToCharArray(), '_');

            return result;
        }

        public static string GetFileVersion()
        {
            // TODO:
            // this implementation copied from WC and should be in the shared component to use it in one place.
            string versionNumber = string.Empty;
            try
            {
                string executingFileLocation = Assembly.GetExecutingAssembly().Location;
                FileVersionInfo fileVersion = FileVersionInfo.GetVersionInfo(executingFileLocation);
                versionNumber = fileVersion.FileVersion;
            }
            catch (Exception ex)
            {
                versionNumber = ex.Message;
            }
            return versionNumber;
        }

        public static object ConvertCurrencyDataObject(object value, bool isDecimal)
        {
            Dictionary<string, object> currencyDict = value as Dictionary<string, object>;
            if (currencyDict == null)
                return currencyDict;

            if (isDecimal)
                return Convert.ToDecimal(currencyDict["a"]);
            else
                return Convert.ToDouble(currencyDict["a"]);
        }

        #region generic composite keys

        public static TCompositeKey GetCompositeKey<TCompositeKey>(this BaseDTO<TCompositeKey> item)
            where TCompositeKey : IBaseCompositeKey, new()
        {

            string[] splittedUri = item.uri.Split('/');
            int internalId = int.Parse(splittedUri.GetValue(splittedUri.Length - 1).ToString());
            return new TCompositeKey { InternalId = internalId, Uri = item.uri };
        }

        #endregion

        #region angle composite keys

        public static AngleCompositeKey GetAngleCompositeKey(string uri)
        {
            return GetAngleCompositeKey(null, uri);
        }
        public static AngleCompositeKey GetAngleCompositeKey(int internalId)
        {
            return GetAngleCompositeKey(internalId, string.Empty);
        }
        public static AngleCompositeKey GetAngleCompositeKey(int? internalId, string uri)
        {
            return new AngleCompositeKey { InternalId = internalId, Uri = uri };
        }

        #endregion

        #region display composite keys

        public static DisplayCompositeKey GetDisplayCompositeKey(string uri)
        {
            return GetDisplayCompositeKey(null, uri);
        }
        public static DisplayCompositeKey GetDisplayCompositeKey(int internalId)
        {
            return GetDisplayCompositeKey(internalId, string.Empty);
        }
        public static DisplayCompositeKey GetDisplayCompositeKey(int? internalId, string uri)
        {
            return new DisplayCompositeKey { InternalId = internalId, Uri = uri };
        }

        #endregion

        #region field composite keys

        public static FieldCompositeKey GetCompositeKey(this Field field)
        {
            FieldCompositeKey compositeKey = GetCompositeKey<FieldCompositeKey>(field);
            compositeKey.BusinessId = field.id;
            return compositeKey;
        }

        public static FieldCompositeKey GetFieldCompositeKey(string businessId)
        {
            return GetFieldCompositeKey(businessId, string.Empty);
        }
        public static FieldCompositeKey GetFieldCompositeKey(string businessId, string uri)
        {
            return GetFieldCompositeKey(null, businessId, uri);
        }
        public static FieldCompositeKey GetFieldCompositeKey(int? internalId, string businessId, string uri)
        {
            return new FieldCompositeKey { InternalId = internalId, BusinessId = businessId, Uri = uri, UniqueXMLElementKey = businessId.AsXMLElementName() };
        }

        #endregion

        #endregion

        #region date time convertion

        private static DateTime _default = new DateTime(1970, 1, 1, 0, 0, 0);

        public static DateTime DefaultDateTime
        {
            get { return _default; }
        }

        public static long ToUnixTimestamp(this DateTime dt)
        {
            return (dt.Ticks - _default.Ticks) / 10000000;
        }

        public static DateTime ToLocalDSTTime(this DateTime date)
        {
            // Have to include current date into ToLocal to have a correct daylight savings result.
            DateTime dt = new DateTime(DateTime.Today.Year, DateTime.Today.Month, DateTime.Today.Day, date.Hour, date.Minute, date.Second);
            DateTime local = dt.ToLocalTime();
            DateTime result = new DateTime(1970, 1, 1, local.Hour, local.Minute, local.Second);

            return result;
        }

        public static long ToGMTTimestamp(this long timestamp)
        {
            DateTime dt = ConvertFromUnixTimestamp(timestamp).ToUniversalTime();
            return dt.ToUnixTimestamp();
        }

        public static DateTime ConvertFromGMTTimestamp(this long timestamp)
        {
            return ConvertFromGMTTimestamp(timestamp, false);
        }

        public static DateTime ConvertFromGMTTimestamp(this long timestamp, bool observeDaylightSavings)
        {
            long ts = Convert.ToInt64(timestamp);
            DateTime dt;
            if (observeDaylightSavings)
            {
                dt = ConvertFromUnixTimestamp(ts).ToLocalDSTTime();
            }
            else
            {
                dt = ConvertFromUnixTimestamp(ts).ToLocalTime();
            }
            return dt;
        }

        public static DateTime ConvertFromUnixTimestamp(this long timestamp)
        {
            return _default.AddSeconds(timestamp);
        }

        #endregion
    }
}