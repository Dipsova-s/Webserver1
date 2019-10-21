using EveryAngle.OData.IntegrationTests.Base.TestCategory;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using NUnit.Framework;
using RestSharp;
using Simple.OData.Client;
using System;
using System.IO;
using System.Net;
using System.Threading.Tasks;

namespace EveryAngle.OData.IntegrationTests.Tests.Setup
{
    [TestFixture]
    public class UserTest : SetupSuite
    {
        private dynamic role;

        #region Initial 

        [SetUp]
        public void Setup()
        {
        }

        [TearDown]
        public void TearDown()
        {
            if (role != null)
            {
                restClient.Delete(context, $"{role.uri}?redirect=false");
            }
        }

        #endregion

        [Test, Order(1)]
        public void ItShouldReturnForbiddenWhenUserHaveNoRight()
        {
            context.OdataUser = new Models.User("EAViewer", "P@ssw0rd");
            ODataClient client = this.odataClient.Get(context, string.Empty);
            WebRequestException ex = Assert.ThrowsAsync<WebRequestException>(() => client.GetMetadataAsStringAsync());
            Assert.That(ex.Code, Is.EqualTo(HttpStatusCode.Forbidden));
        }

        [Test, Order(2)]
        public async Task ItShouldPossibleToGetMetaDataWhenUserHaveRight()
        {
            SetUpUser();
            ODataClient client = this.odataClient.Get(context, string.Empty);
            string content = await client.GetMetadataAsStringAsync();
            Assert.IsTrue(!string.IsNullOrEmpty(content));
        }

        #region Setup User/Role

        private void SetUpUser()
        {
            CreateRole();
            AssignRoleToUser();
        }

        private void CreateRole()
        {
            string body = File.ReadAllText(Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "TestResources", "Role", "OdataRole.json"));
            IRestResponse response = restClient.Post(context, "system/roles?redirect=false", body);
            Assert.AreEqual(HttpStatusCode.Created, response.StatusCode);
            role = JsonConvert.DeserializeObject<dynamic>(response.Content);
        }

        private void AssignRoleToUser()
        {
            IRestResponse response = restClient.Get(context, $"users?q={context.OdataUser.UserName}");
            Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.OK));
            JObject users = JsonConvert.DeserializeObject<JObject>(response.Content);
            Assert.AreEqual(1, users.SelectToken("header").SelectToken("total").Value<int>());
            JObject user = users.SelectToken("users")[0] as JObject;
            JArray userRoles = user["assigned_roles"] as JArray;
            //User should have only SYSTEM_ALL
            Assert.AreEqual(1, userRoles.Count);
            Assert.AreEqual("SYSTEM_ALL", userRoles[0].SelectToken("role_id").ToString());
            userRoles.Add(JObject.Parse("{\"role_id\":\"" + role.id + "\",\"model_id\":\"" + role.model_authorization.model_id + "\"}"));
            response = restClient.Put(context, $"{user.SelectToken("uri").ToString()}?redirect=false", JsonConvert.SerializeObject(user));
            Assert.AreEqual(HttpStatusCode.OK, response.StatusCode);

            //Verify the new role is assigned
            user = JsonConvert.DeserializeObject<JObject>(response.Content);
            userRoles = user["assigned_roles"] as JArray;
            Assert.AreEqual(2, userRoles.Count);
        }

        #endregion Setup User/Role
    }
}