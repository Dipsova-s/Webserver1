using EveryAngle.WebClient.Service.LogHandlers;
using EveryAngle.WebClient.Web.CSTests.TestBase;
using NUnit.Framework;
using RestSharp;

namespace EveryAngle.WebClient.Web.CSTests.ServiceTests
{
    [TestFixture]
    public class LogManagerTests : UnitTestBase
    {
        [TestCase("password/changepassword", "{\"username\":\"eaadmin\",\"oldpassword\":\"********************\"}", "{\"username\":\"eaadmin\",\"oldpassword\":\"SpecialCharsTest!@#$%^&*()_+\"}")]
        [TestCase("password/changepassword", "{\"username\":\"eaadmin\",\"newpassword\":\"********************\"}", "{\"username\":\"eaadmin\",\"newpassword\":\"LetterWithNumericTest1234567890\"}")]
        [TestCase("/everyangle/randomUrl", "{\"username\":\"eaadmin\",\"oldpassword\":\"********************\",\"newpassword\":\"********************\"}", "{\"username\":\"eaadmin\",\"oldpassword\":\"VeryVeryLonggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggg\",\"newpassword\":\"VeryVeryLonggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggg\"}")]
        public void Can_Anonymize_Password_Properties(string url, string expectedResult, string body)
        {
            string actualResult = LogManager.ParseBodyContentLogging(url, body, Method.PUT, false);
            Assert.AreEqual(expectedResult, actualResult);
        }

        [TestCase("/agent/download_settings", "{\"setting_list\":[{\"id\":\"copy_smb_username\",\"value\":\"sapuser\"},{\"id\":\"copy_smb_password\",\"value\":\"********************\"}]}", "{\"setting_list\":[{\"id\":\"copy_smb_username\",\"value\":\"sapuser\"},{\"id\":\"copy_smb_password\",\"value\":\"SpecialCharsTest!@#$%^&*()_+\"}]}")]
        [TestCase("/agent/download_settings", "{\"setting_list\":[{\"id\":\"sap_username\",\"value\":\"sapuser\"},{\"id\":\"sap_password\",\"value\":\"********************\"}]}", "{\"setting_list\":[{\"id\":\"sap_username\",\"value\":\"sapuser\"},{\"id\":\"sap_password\",\"value\":\"LetterWithNumericTest1234567890\"}]}")]
        public void Can_Anonymize_Password_Settings_KnownURL(string url, string expectedResult, string body)
        {
            string actualResult = LogManager.ParseBodyContentLogging(url, body, Method.PUT, false);
            Assert.AreEqual(expectedResult, actualResult);
        }

        [TestCase("/tasks", "{\"arguments\":[{\"name\":\"run_as_user\",\"value\":\"tester_1\"},{\"name\":\"password\",\"value\":\"********************\"}]}", "{\"arguments\":[{\"name\":\"run_as_user\",\"value\":\"tester_1\"},{\"name\":\"password\",\"value\":\"SpecialCharsTest!@#$%^&*()_+\"}]}")]
        [TestCase("/tasks/99999", "{\"arguments\":[{\"name\":\"run_as_user\",\"value\":\"tester_2\"},{\"name\":\"password\",\"value\":\"********************\"}]}", "{\"arguments\":[{\"name\":\"run_as_user\",\"value\":\"tester_2\"},{\"name\":\"password\",\"value\":\"LetterWithNumericTest1234567890\"}]}")]
        public void Can_Anonymize_Password_Names_KnownURL(string url, string expectedResult, string body)
        {
            string actualResult = LogManager.ParseBodyContentLogging(url, body, Method.PUT, false);
            Assert.AreEqual(expectedResult, actualResult);
        }

        [TestCase("/agent/modelserver_settings", "{\"setting_list\":[{\"id\":\"database_manager_connection_string\",\"value\":\"Server=nl-test.eatestad.local;Database=DB_Name;User Id=admin;Password=********************;MultipleActiveResultSets=true\"}]}", "{\"setting_list\":[{\"id\":\"database_manager_connection_string\",\"value\":\"Server=nl-test.eatestad.local;Database=DB_Name;User Id=admin;Password=SpecialCharsTest!@#$%^&*()_+;MultipleActiveResultSets=true\"}]}")]
        [TestCase("/system/datastores", "{\"setting_list\":[{\"id\":\"odbc_connection_string\",\"value\":\"Server=nl-test.eatestad.local;Database=DB_Name;Uid=admin;Pwd=********************\"}]}", "{\"setting_list\":[{\"id\":\"odbc_connection_string\",\"value\":\"Server=nl-test.eatestad.local;Database=DB_Name;Uid=admin;Pwd=SpecialCharsTest!@#$%^&*()_+\"}]}")]
        [TestCase("/system/datastores", "{\"setting_list\":[{\"id\":\"odbc_connection_string\",\"value\":\"Server=nl-test.eatestad.local;Database=DB_Name;Uid=admin;Password=********************;TestProperty=TestValue\"}]}", "{\"setting_list\":[{\"id\":\"odbc_connection_string\",\"value\":\"Server=nl-test.eatestad.local;Database=DB_Name;Uid=admin;Password=SpecialCharsTest!@#$%^&*()_+;TestProperty=TestValue\"}]}")]
        public void Can_Anonymize_SubstringPassword_Settings(string url, string expectedResult, string body)
        {
            string actualResult = LogManager.ParseBodyContentLogging(url, body, Method.PUT, false);
            Assert.AreEqual(expectedResult, actualResult);
        }

        [TestCase("/everyangle/randomUrl", "{\"setting_list\":[{\"id\":\"username\",\"value\":\"sapuser\"},{\"id\":\"sap_password\",\"value\":\"LetterWithNumericTest1234567890\"}]}", "{\"setting_list\":[{\"id\":\"username\",\"value\":\"sapuser\"},{\"id\":\"sap_password\",\"value\":\"LetterWithNumericTest1234567890\"}]}")]
        public void Get_Unchanged_Body_WhenUnknownURL(string url, string expectedResult, string body)
        {
            string actualResult = LogManager.ParseBodyContentLogging(url, body, Method.PUT, false);
            Assert.AreEqual(expectedResult, actualResult);
        }

        [TestCase("/agent/modelserver_settings", "{\"setting_list\":[{\"id\":\"username\",\"value\":\"user\"},{\"id\":\"dummy_password\",\"value\":\"LetterWithNumericTest1234567890\"}]}", "{\"setting_list\":[{\"id\":\"username\",\"value\":\"user\"},{\"id\":\"dummy_password\",\"value\":\"LetterWithNumericTest1234567890\"}]}")]
        public void Get_Unchanged_Body_WhenNoMatchingSettings(string url, string expectedResult, string body)
        {
            string actualResult = LogManager.ParseBodyContentLogging(url, body, Method.PUT, false);
            Assert.AreEqual(expectedResult, actualResult);
        }

        [TestCase("/agent/modelserver_settings", "Unable to parse body: PUT /agent/modelserver_settings", "{\"setting_list\":[{\"id\":\"username\",\"value:\"user\"},{\"id\":\"dummy_password\",\"value\":\"LetterWithNumericTest1234567890\"}]}")]
        public void Get_ErrorMessage_Body_WhenInvalidBody(string url, string expectedResult, string body)
        {
            string actualResult = LogManager.ParseBodyContentLogging(url, body, Method.PUT, false);
            Assert.AreEqual(expectedResult, actualResult);
        }
    }
}
