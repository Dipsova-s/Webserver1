using EveryAngle.OData.IntegrationTests.Base.TestCategory;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using NUnit.Framework;
using Simple.OData.Client;
using System;
using System.IO;
using System.Threading.Tasks;
using System.Xml;

namespace EveryAngle.OData.IntegrationTests.Tests.Setup
{
    [TestFixture]
    public class AngleTest : AcceptanceSuite
    {
        private dynamic role;

        [SetUp]
        public void Setup()
        {
            SetUpUser();
        }

        [TearDown]
        public void TearDown()
        {
            if (role != null)
            {
                restClient.Delete(context, $"{role.uri}?redirect=false");
            }
        }

        [Ignore("Wait for acceptance category")]
        [Test]
        public async Task UserShouldAllowToAccessOdata()
        {
            ODataClient client = this.odataClient.Get(context, string.Empty);
            string content = await client.GetMetadataAsStringAsync();
            XmlDocument doc = new XmlDocument();
            doc.Load(new StringReader(content));

            XmlNodeList entitySet = doc.GetElementsByTagName("EntitySet");
            XmlNodeList entityType = doc.GetElementsByTagName("EntityType");

            var x = ODataDynamic.Expression;
            foreach (var set in entitySet)
            {
                var angle = await client.For(entitySet.Item(0).Attributes["Name"].Value).FindEntriesAsync();
                string ss = "";


            }

             



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
            dynamic modelrole = JsonConvert.DeserializeObject<dynamic>(restClient.Post(context, "system/roles?redirect=false", body).Content);
            role = modelrole;
        }

        private void AssignRoleToUser()
        {
            JObject user = JsonConvert.DeserializeObject<JObject>(restClient.Get(context, $"users?q={context.OdataUser.UserName}").Content).users[0];
            JArray roles = user["assigned_roles"] as JArray;
            roles.Add(JObject.Parse("{\"role_id\":\"" + role.id + "\",\"model_id\":\"" + role.model_authorization.model_id + "\"}"));
            restClient.Put(context, $"{user.SelectToken("uri").ToString()}?redirect=false", JsonConvert.SerializeObject(user));
        }

        #endregion Setup User/Role
    }
}