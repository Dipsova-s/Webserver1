﻿using EveryAngle.Core.ViewModels.FieldCategory;
using EveryAngle.Core.ViewModels.Model;
using EveryAngle.Core.ViewModels.Privilege;
using EveryAngle.Core.ViewModels.Users;
using EveryAngle.ManagementConsole.Helpers;
using Newtonsoft.Json.Linq;
using NUnit.Framework;
using System;
using System.Collections.Generic;
using System.Linq;

namespace EveryAngle.ManagementConsole.Test.Helpers
{
    public class ConsolidateRoleHelperTests : UnitTestBase
    {
        #region private variables

        private JToken _testingToken;
        private readonly ConsolidatedRoleViewModel _testingViewModel = new ConsolidatedRoleViewModel();

        #endregion

        #region setup/teardown

        [SetUp]
        public override void Setup()
        {
            InitiateTestingViewModel();
            InitiateTestingJToken();
            base.Setup();
        }

        #endregion

        #region tests

        [TestCase("uri", "\"Uri\": mocks/1/uri/2", true)]
        [TestCase("user_count", "\"User count\": 10", true)]
        [TestCase("system_privileges", "\"System privileges\": null", false)]
        [TestCase("subrole_ids", "\"Subrole ids\": [\r\n  \"mock_role_1\",\r\n  \"mock_role_2\"\r\n]", true)]
        [TestCase("system_privileges", "\"System privileges\": {\r\n  \"manage_system\": false,\r\n  \"allow_impersonation\": true,\r\n  \"has_management_access\": true\r\n}", true)]
        public void Can_GetJsonStringOfPrivilegeProperty(string property, string expectedValue, bool hasResult)
        {
            if (!hasResult)
            {
                _testingViewModel.SystemPrivileges = null;
                _testingToken = JToken.FromObject(_testingViewModel);
            }

            string jsonString = ConsolidateRoleHelper.GetJsonStringOfPrivilegeProperty(_testingToken, property);
            Assert.IsNotNullOrEmpty(jsonString);
            Assert.AreEqual(expectedValue, jsonString);
        }


        [TestCase(true, false, "\"Content\": \"configure\"")]
        [TestCase(true, true, "\"Content\": \"edit\"")]
        [TestCase(false, false, "\"Content\": \"denied\"")]
        public void Can_GetJsonStringOfModelingWorkbenchContentPrivilegeProperty(bool? configureContent, bool? editContent, string expectedValue)
        {
            _testingToken["model_authorization"]["privileges"]["configure_content"] = configureContent;
            _testingToken["model_authorization"]["privileges"]["edit_content"] = editContent;
            string jsonString = ConsolidateRoleHelper.GetJsonStringOfModelingWorkbenchContentPrivilegeProperty(_testingToken["model_authorization"]["privileges"], "configure_content", "edit_content");
            Assert.IsNotNullOrEmpty(jsonString);
            Assert.AreEqual(expectedValue, jsonString);
        }

        [TestCase(false)]
        [TestCase(true)]
        public void Can_CreatePrivilegeProperty(bool setToInvalidNode)
        {
            JEnumerable<JProperty> properties = new JEnumerable<JProperty>();
            _testingToken = JToken.FromObject(_testingViewModel.ModelPrivilege.Privileges);
            properties = ConsolidateRoleHelper.CreatePrivilegeProperty(_testingToken, properties);

            if (setToInvalidNode)
            {
                // set to an invalid node
                _testingToken = JToken.FromObject(_testingViewModel.ModelPrivilege);
                properties = ConsolidateRoleHelper.CreatePrivilegeProperty(_testingToken, properties);
            }

            // even properties is set to invalid/non-existing node the object should not be replaced.
            Assert.IsNotEmpty(properties);
        }

        [TestCase(true)]
        [TestCase(false)]
        public void Can_OrderModelPrivilege(bool containPrivileges)
        {
            JEnumerable<JProperty> properties = new JEnumerable<JProperty>();
            if (containPrivileges)
            {
                // should sort as expecting
                _testingToken = JToken.FromObject(_testingViewModel.ModelPrivilege);
                properties = ConsolidateRoleHelper.OrderModelPrivilege(_testingToken, properties);

                Assert.AreEqual("privileges", properties.ElementAt(0).Name);
                Assert.AreEqual("label_authorizations", properties.ElementAt(1).Name);
                Assert.AreEqual("allowed_classes", properties.ElementAt(2).Name);
                Assert.AreEqual("denied_classes", properties.ElementAt(3).Name);
                Assert.AreEqual("field_authorizations", properties.ElementAt(4).Name);
                Assert.AreEqual("object_filters", properties.ElementAt(5).Name);
            }
            else
            {
                // should no sorting
                properties = new JObject {
                    new JProperty("test2", true),
                    new JProperty("test1", false)
                }.Children<JProperty>();

                _testingToken = JToken.FromObject(new
                {
                    test2 = true,
                    test1 = false
                });
                JEnumerable<JProperty> expectProperties = ConsolidateRoleHelper.OrderModelPrivilege(_testingToken, properties);
                Assert.AreEqual(expectProperties, properties);
            }
        }

        [TestCase("true", "allowed")]
        [TestCase("allowed", "allowed")]
        [TestCase("false", "denied")]
        [TestCase("disallowed", "denied")]
        [TestCase("denied", "denied")]
        [TestCase("unspecified", "unspecified")]
        [TestCase("NOT_EXISTING_STATE", "NOT_EXISTING_STATE")]
        [TestCase("edit", "edit")]
        [TestCase("configure", "configure")]
        public void Can_ChangePriviledgeState(string state, string expectedState)
        {
            JEnumerable<JProperty> properties = new JEnumerable<JProperty>();
            _testingToken = JToken.FromObject(_testingViewModel.ModelPrivilege.Privileges);
            properties = ConsolidateRoleHelper.CreatePrivilegeProperty(_testingToken, properties);

            string privillegeState = string.Empty;
            foreach (JProperty property in properties)
            {
                privillegeState = ConsolidateRoleHelper.ChangePriviledgeState(state, _testingToken, property);
                Assert.AreEqual(privillegeState, expectedState);
            }
        }

        [TestCase("deny", "denied")]
        [TestCase("non-exist-state", "non-exist-state")]
        public void Can_ChangePriviledgeState_With_DefaultBP(string state, string expectedState)
        {
            JEnumerable<JProperty> properties = new JEnumerable<JProperty>();
            _testingToken = JToken.FromObject(_testingViewModel.ModelPrivilege.Privileges);
            ConsolidateRoleHelper.CreatePrivilegeProperty(_testingToken, properties);

            JProperty property = new JProperty("default_label_authorization");
            string privillegeState = ConsolidateRoleHelper.ChangePriviledgeState(state, _testingToken, property);

            Assert.AreEqual(privillegeState, expectedState);
        }

        [TestCase]
        public void Can_CreateClassProperty()
        {
            JToken token = JToken.FromObject(new
            {
                classes = new List<string> { "i-am-classes-1" },
                reference_filters = "i-am-reference_filters",
                field_filters = "i-am-field_filters",
                fieldvalue_filters = "i-am-fieldvalue_filters",
                modelserver_authorization = new { field_authorizations = "" }
            });
            JEnumerable<JProperty> properties = ConsolidateRoleHelper.CreateClassProperty(token, token["modelserver_authorization"]["field_authorizations"]);

            Assert.IsNotEmpty(properties);
        }

        [TestCase]
        public void Can_CreateClassProperty_Without_Classes()
        {
            JToken token = JToken.FromObject(new
            {
                modelserver_authorization = new { field_authorizations = "" }
            });

            JEnumerable<JProperty> properties = ConsolidateRoleHelper.CreateClassProperty(token, token["modelserver_authorization"]["field_authorizations"]);
            Assert.IsNotEmpty(properties);
        }

        [TestCase("field_id_1", "/fieldsources/1", "short_name_1")]
        [TestCase("field_id_2", "/fieldsources/2", "")]
        [TestCase("field_id_3", "/fieldsources/3", "short_name_2")]
        public void Can_GetFieldNameWithFieldSource(string fieldId, string uri, string shortName)
        {
            List<Field> fields = new List<Field>
            {
                new Field
                {
                    id = fieldId,
                    short_name = shortName
                }
            };

            if (fieldId == "field_id_3")
                fields.Clear();

            List<FieldCategoryViewModel> fieldSources = new List<FieldCategoryViewModel>
            {
                new FieldCategoryViewModel
                {
                    uri = new Uri(uri, UriKind.Relative),
                    short_name = fieldId.Split('_').Last()
                }
            };

            string fieldName = ConsolidateRoleHelper.GetFieldNameWithFieldSource(fields, fieldId, fieldSources);

            Assert.IsNotNullOrEmpty(fieldName);
        }

        #endregion

        #region private functions

        protected override void InitiateTestingViewModel()
        {
            _testingViewModel.SystemPrivileges = new SystemPrivilegeViewModel
            {
                manage_system = false,
                manage_users = null,
                allow_impersonation = true,
                has_management_access = true
            };
            _testingViewModel.ModelPrivilege = new ModelPrivilegeViewModel
            {
                AllowedClasses = new List<string> { "mock_allowed_class" },
                authorizationsUri = new Uri("/mock/1/uri", UriKind.Relative),
                DefaultClassAuthorization = true,
                DefaultLabelAuthorization = "P2P",
                DeniedClasses = new List<string> { "mock_denied_class" },
                FieldAuthorizations = new List<FieldAuthorizationViewModel>(),
                LabelAuthorizations = new Dictionary<string, string>(),
                model = new Uri("/models/1", UriKind.Relative),
                ModelName = "MOCK2_800",
                model_id = "MOCK2_800",
                ObjectFilter = new List<ObjectFilterViewModel>(),
                Privileges = new PrivilegesForModelViewModel(),
                roles = new List<AssignedRoleViewModel>()
            };
            _testingViewModel.user_count = 10;
            _testingViewModel.uri = "mocks/1/uri/2";
            _testingViewModel.subrole_ids = new List<string> { "mock_role_1", "mock_role_2" };
        }

        protected override void InitiateTestingJToken()
        {
            _testingToken = JToken.FromObject(_testingViewModel);
        }

        #endregion
    }
}
