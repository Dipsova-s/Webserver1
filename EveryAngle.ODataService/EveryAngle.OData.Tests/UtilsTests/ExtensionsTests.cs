using EveryAngle.OData.DTO;
using EveryAngle.OData.DTO.Settings;
using EveryAngle.OData.Settings;
using EveryAngle.OData.Utils;
using EveryAngle.OData.Utils.Constants;
using EveryAngle.OData.Utils.Logs;
using EveryAngle.OData.ViewModel.Settings;
using NUnit.Framework;
using System;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.Linq;

namespace EveryAngle.OData.Tests.UtilsTests
{
    // only test for explicitly call functions
    [TestFixture(Category = "Utilities")]
    public class ExtensionsTests : UnitTestBase
    {
        #region setup/teardown

        [SetUp]
        public void Setup()
        {
            // setup
        }

        [TearDown]
        public void TearDown()
        {
            // tear down
        }

        #endregion

        #region tests

        [TestCase("TEST_ID_LONGER", 5, "TEST_")]
        [TestCase("TEST2_ID_SHORTER", 20, "TEST2_ID_SHORTER")]
        [TestCase("TEST3_ID_EQUAL", 14, "TEST3_ID_EQUAL")]
        [TestCase("", 20, "")]
        [TestCase(null, 0, null)]
        public void Can_GenerateTruncateBusinessId(string idString, int maxLength, string expectedResult)
        {
            string truncatedId = idString.Truncate(maxLength);
            Assert.AreEqual(expectedResult, truncatedId);
        }

        [TestCase("models/20", 20)]
        [TestCase("models/20/instances/14", 14)]
        [TestCase("models/1/angles/5", 5)]
        [TestCase("models/1/angles/5/displays/14", 14)]
        public void Can_GetInternalIdFromUri(string uri, int expectedInternalId)
        {
            Assert.AreEqual(expectedInternalId, uri.IdFromUri());
        }

        [TestCase("ID_1", "ID_1")]
        [TestCase("ID__2", "2")]
        [TestCase("ID____3", "3")]
        [TestCase("ID__BLAH_4", "BLAH_4")]
        [TestCase("ID__BLAH__5", "5")]
        [TestCase("ID6", "ID6")]
        [TestCase("ID7__", "ID7")]
        [TestCase("__ID8__", "ID8")]
        [TestCase("__ID9", "ID9")]
        public void Can_CleanBusinessId(string businessId, string expectedBusinessId)
        {
            Assert.AreEqual(expectedBusinessId, businessId.CleanId());
        }

        [TestCase("ID_1", "ID_1")]
        [TestCase("ID__2", "2")]
        [TestCase("ID____3", "3")]
        [TestCase("ID__BLAH_4", "BLAH_4")]
        [TestCase("ID__BLAH__5", "5")]
        [TestCase("ID6", "ID6")]
        [TestCase("ID7__", "")]
        [TestCase("__ID8__", "")]
        [TestCase("__ID9", "ID9")]
        public void Can_GetEntitySetId(string businessId, string expectedBusinessId)
        {
            Assert.AreEqual(expectedBusinessId, businessId.EntitySetId());
        }

        [TestCase(null, "<no value> (<no value>)")]
        [TestCase("", "")]
        [TestCase(123, "123")]
        [TestCase("STRING", "STRING")]
        [TestCase(LogLevel.ERROR, "ERROR")]
        public void Can_GetNullValueText(object valueObject, string expectedValue)
        {
            Assert.AreEqual(expectedValue, valueObject.GetNullValueText());
        }

        [TestCase]
        public void Can_GetQueryArgs()
        {
            NameValueCollection emptyCollection = new NameValueCollection();
            NameValueCollection valueCollection = new NameValueCollection();
            valueCollection.Add("TEST1", "RETURN_VALUE");
            valueCollection.Add("TEST2", "10");

            string test1_value = valueCollection.GetQueryArgs<string>("TEST1");
            int test2_value = valueCollection.GetQueryArgs<int>("TEST2");
            string nonExisting_value = valueCollection.GetQueryArgs<string>("NON_EXISTING");
            string empty_value = emptyCollection.GetQueryArgs<string>("NON_EXISTING");

            Assert.AreEqual("RETURN_VALUE", test1_value);
            Assert.AreEqual(10, test2_value);
            Assert.AreEqual(null, nonExisting_value);
            Assert.AreEqual(null, empty_value);
        }

        // angle: 10, display: 10 => angle: 10, display: 10
        [TestCase("1234567890", "1234567890", "list", "1234567890_1234567890_")]
        // angle: 30, display: 30 => angle: 30, display: 30
        [TestCase("123456789a123456789b123456789c", "123456789a123456789b123456789c", "chart", "123456789a123456789b123456789c_123456789a123456789b123456789c_")]
        // angle: 30, display:110 -> angle: 20, display: 91
        [TestCase("123456789a123456789b123456789c", "123456789a123456789b123456789c123456789d123456789e123456789f123456789g123456789h123456789i123456789j123456789k", "pivot", "123456789a123456789b_123456789a123456789b123456789c123456789d123456789e123456789f123456789g123456789h123456789i123_")]
        // angle: 60, display:80 -> angle: 34, display: 80
        [TestCase("123456789a123456789b123456789c123456789d123456789e123456789f", "123456789a123456789b123456789c123456789d123456789e123456789f123456789g123456789h", "list", "123456789a123456789b123456789c123_123456789a123456789b123456789c123456789d123456789e123456789f123456789g123456789h_")]
        // angle: 21, display:110 -> angle: 21, display: 92
        [TestCase("123456789a123456789b1", "123456789a123456789b123456789c123456789d123456789e123456789f123456789g123456789h123456789i123456789j123456789k", "pivot", "123456789a123456789b1_123456789a123456789b123456789c123456789d123456789e123456789f123456789g123456789h123456789i12_")]
        // angle: 22, display:110 -> angle: 22, display: 91
        [TestCase("123456789a123456789b12", "123456789a123456789b123456789c123456789d123456789e123456789f123456789g123456789h123456789i123456789j123456789k", "chart", "123456789a123456789b12_123456789a123456789b123456789c123456789d123456789e123456789f123456789g123456789h123456789i1_")]
        // angle: 23, display:110 -> angle: 20, display: 91
        [TestCase("123456789a123456789b123", "123456789a123456789b123456789c123456789d123456789e123456789f123456789g123456789h123456789i123456789j123456789k", "pivot", "123456789a123456789b_123456789a123456789b123456789c123456789d123456789e123456789f123456789g123456789h123456789i123_")]
        public void Can_GetUniqueEntityName(string angleName, string displayName, string displayType, string expectedEntityName)
        {
            Display testingDisplay = new Display 
            { 
                uri = "/models/1/angles/10/displays/100", 
                name = displayName,
                display_type = displayType
            };
            Angle angle = new Angle { name = angleName };
            testingDisplay.SetAngle(angle);
            Assert.AreEqual(expectedEntityName + displayType.ToUpperInvariant().First() + "1_10_100", testingDisplay.UniqueEntityName());
        }

        [TestCase(1)]
        public void Can_GetAngleCompositeKey(int internalId)
        {
            AngleCompositeKey compositeKey = Extensions.GetAngleCompositeKey(internalId);
            Assert.IsNotNull(compositeKey);
            Assert.AreEqual(internalId, compositeKey.InternalId);
        }

        [TestCase(1, "models/1/angles/1/displays/2")]
        public void Can_GetDisplayCompositeKey(int internalId, string uri)
        {
            DisplayCompositeKey compositeKey_uri = Extensions.GetDisplayCompositeKey(uri);
            DisplayCompositeKey compositeKey_id = Extensions.GetDisplayCompositeKey(internalId);
            DisplayCompositeKey compositeKey_both = Extensions.GetDisplayCompositeKey(internalId, uri);

            Assert.IsNotNull(compositeKey_uri);
            Assert.IsNotNull(compositeKey_id);
            Assert.IsNotNull(compositeKey_both);

            Assert.AreEqual(uri, compositeKey_uri.Uri);
            Assert.AreEqual(null, compositeKey_uri.InternalId);

            Assert.AreEqual(uri, compositeKey_uri.Uri);
            Assert.AreEqual(1, compositeKey_id.InternalId);
            Assert.AreEqual(uri, compositeKey_both.Uri);
            Assert.AreEqual(1, compositeKey_both.InternalId);
        }

        [TestCase(1, "models/1/angles/1/displays/2", "test_business_id")]
        public void Can_GetDisplayCompositeKey(int internalId, string uri, string businessId)
        {
            FieldCompositeKey compositeKey_uri = Extensions.GetFieldCompositeKey(businessId, uri);
            FieldCompositeKey compositeKey_businessid = Extensions.GetFieldCompositeKey(internalId, businessId, uri);

            Assert.IsNotNull(compositeKey_uri);
            Assert.IsNotNull(compositeKey_businessid);

            Assert.AreEqual(uri, compositeKey_uri.Uri);
            Assert.AreEqual(businessId, compositeKey_businessid.BusinessId);
            Assert.AreEqual(internalId, compositeKey_businessid.InternalId);
            Assert.AreEqual(uri, compositeKey_businessid.Uri);
        }

        [TestCase(111, "models/1/instances/2/fields/111", "111_business_id")]
        public void Can_GetUniqueEntityName(int internalId, string fieldUri, string businessId)
        {
            Field testingField = new Field { uri = fieldUri, id = businessId };
            FieldCompositeKey compositeKey = testingField.GetCompositeKey();

            Assert.AreEqual(internalId, compositeKey.InternalId);
            Assert.AreEqual(fieldUri, compositeKey.Uri);
            Assert.AreEqual(businessId, compositeKey.BusinessId);
        }

        [TestCase]
        public void Can_GetDefaultDateTime()
        {
            Assert.IsNotNull(Extensions.DefaultDateTime);
        }

        [TestCase]
        public void Can_ConvertToLocalDSTTime()
        {
            DateTime testingDateTime = Extensions.DefaultDateTime.ToLocalDSTTime();
            Assert.IsNotNull(testingDateTime);
        }

        [TestCase]
        public void Can_ConvertFromGMTTimestamp()
        {
            long testingTimestamp = Extensions.DefaultDateTime.ToUnixTimestamp();
            Assert.IsNotNull(testingTimestamp.ConvertFromGMTTimestamp());
            Assert.AreEqual(testingTimestamp.ConvertFromUnixTimestamp().ToLocalDSTTime(), testingTimestamp.ConvertFromGMTTimestamp(true));
        }

        [TestCase]
        public void Verified_ODataSettingsInstance()
        {
            ODataSettingsViewModel internalSetting = new ODataSettingsViewModel();
            internalSetting.angles_query = "";
            internalSetting.host = "";
            internalSetting.max_angles = 1;
            internalSetting.metadata_resync_minutes = 2;
            internalSetting.model_id = "3";
            internalSetting.page_size = 4;
            internalSetting.password = "";
            internalSetting.timeout = 6;
            internalSetting.user = "";
            internalSetting.web_client_uri = "";
            internalSetting.enable_compression = true;

            Assert.IsAssignableFrom(typeof(string), internalSetting.angles_query);
            Assert.IsAssignableFrom(typeof(string), internalSetting.host);
            Assert.IsAssignableFrom(typeof(int), internalSetting.max_angles);
            Assert.IsAssignableFrom(typeof(int), internalSetting.metadata_resync_minutes);
            Assert.IsAssignableFrom(typeof(string), internalSetting.model_id);
            Assert.IsAssignableFrom(typeof(int), internalSetting.page_size);
            Assert.IsAssignableFrom(typeof(string), internalSetting.password);
            Assert.IsAssignableFrom(typeof(int), internalSetting.timeout);
            Assert.IsAssignableFrom(typeof(string), internalSetting.user);
            Assert.IsAssignableFrom(typeof(string), internalSetting.web_client_uri);
            Assert.IsAssignableFrom(typeof(bool), internalSetting.enable_compression);
        }

        [TestCase]
        public void Verified_ODataSettingsInstance_Constructor()
        {
            ODataSettingsViewModel internalSetting = new ODataSettingsViewModel();
            SettingsDTO settingDto = internalSetting.Convert();

            Assert.AreEqual(internalSetting.angles_query, settingDto.AnglesQuery);
            Assert.AreEqual(internalSetting.host, settingDto.Host);
            Assert.AreEqual(internalSetting.max_angles, settingDto.MaxAngles);
            Assert.AreEqual(internalSetting.metadata_resync_minutes, settingDto.MetadataResyncMinutes);
            Assert.AreEqual(internalSetting.model_id, settingDto.ModelId);
            Assert.AreEqual(internalSetting.page_size, settingDto.PageSize);
            Assert.AreEqual(internalSetting.password, settingDto.Password);
            Assert.AreEqual(internalSetting.timeout, settingDto.TimeOut);
            Assert.AreEqual(internalSetting.user, settingDto.User);
            Assert.AreEqual(internalSetting.web_client_uri, settingDto.WebClientUri);
            Assert.AreEqual(internalSetting.enable_compression, settingDto.EnableCompression);
        }

        [TestCase]
        public void Verified_Accessible_RawJToken()
        {
            Assert.IsAssignableFrom(typeof(SettingsDTO), ODataSettings.Settings);
            Assert.IsAssignableFrom(typeof(ODataSettingsViewModel), ODataSettings.ViewModel);
        }

        [TestCase("NEWMODEL_ID5435124351465164")]
        public void Can_UpdateInitialized_Setting(string modelId)
        {
            // first check if the 'current' is not the same
            Assert.AreNotEqual(modelId, ODataSettings.Settings.ModelId);

            // try to update
            ODataSettings.Update(new ODataSettingsViewModel { model_id = modelId });
            Assert.AreEqual(modelId, ODataSettings.Settings.ModelId);

            // then change back
            ODataSettings.Update(new ODataSettingsViewModel { model_id = "EA2_800" });
            Assert.AreEqual("EA2_800", ODataSettings.Settings.ModelId);
        }

        [TestCase("CONVERT_!@#$%^&*()-=+/\\\"'?:;â˜ºâ˜»â™¥â™¦â™£â™ â€¢â—˜â—‹1", "CONVERT__1")]
        public void Can_Convert_AsXMLElementName(string convertingText, string expectedConverted)
        {
            string convertedText = Extensions.AsXMLElementName(convertingText);

            Assert.IsNotNull(convertedText);
            Assert.AreEqual(expectedConverted, convertedText);
        }

        [TestCase("CONVERT_!@#$%^&*()-=+/\\\"'?:;â˜ºâ˜»â™¥â™¦â™£â™ â€¢â—˜â—‹1", "/models/1/instances/2/fields/7", "CONVERT__1_7")]
        [TestCase("ABC1", "/models/1/instances/2/fields/8", "ABC1")]
        [TestCase("ABC__1", "/models/1/instances/2/fields/8", "ABC__1")]
        public void Can_Convert_AsXMLElementName(string testingBusinessId, string testingUri, string expectedConverted)
        {
            Field testingField = new Field { id = testingBusinessId, uri = testingUri };
            string convertedText = Extensions.AsXMLElementName(testingField);

            Assert.IsNotNull(convertedText);
            Assert.AreEqual(expectedConverted, convertedText);
        }

        [TestCase("business_id", "/models/1/instances/2/fields/7",  "CONVERT_1", "CONVERT_1")]
        public void Can_UpdateUniqueXMLElementKey(string testingBusinessId, string testingUri, string updatingKey, string expectedKey)
        {
            Field testingField = new Field { id = testingBusinessId, uri = testingUri };
            Assert.IsNull(testingField.CompositeKey.UniqueXMLElementKey);

            testingField.UpdateUniqueXMLElementKey(updatingKey);

            Assert.IsNotNull(testingField.CompositeKey.UniqueXMLElementKey);
            Assert.AreEqual(expectedKey, testingField.CompositeKey.UniqueXMLElementKey);
        }

        [TestCase(true)]
        [TestCase(false)]
        public void Can_ConvertCurrencyDataObject(bool isDecimal)
        {
            Dictionary<string, object> testingObject = new Dictionary<string, object>();
            if (isDecimal)
                testingObject.Add("a", 2.5789m);
            else
                testingObject.Add("a", 2.5789d);

            object convertedObject = Extensions.ConvertCurrencyDataObject(testingObject, isDecimal);

            if (isDecimal)
                Assert.IsTrue(convertedObject is decimal);
            else
                Assert.IsTrue(convertedObject is double);
        }

        [TestCase]
        public void Can_ConvertCurrencyDataObject_NullObject()
        {
            Dictionary<string, object> nullObject = null;
            string otherObject = null;

            object convertedNullObject = Extensions.ConvertCurrencyDataObject(nullObject, false);
            object convertedOtherObject = Extensions.ConvertCurrencyDataObject(otherObject, false);

            Assert.IsNull(convertedNullObject);
            Assert.IsNull(convertedOtherObject);
        }

        #endregion
    }
}
