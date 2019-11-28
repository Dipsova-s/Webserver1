using EveryAngle.OData.DTO;
using EveryAngle.OData.IntegrationTests.Clients.Appserver;
using EveryAngle.OData.IntegrationTests.Clients.OData;
using EveryAngle.OData.IntegrationTests.Clients.OData.Services;
using EveryAngle.OData.ViewModel.Settings;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using NUnit.Framework;
using RestSharp;
using Simple.OData.Client;
using System;
using System.Configuration;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Net;
using System.Threading;
using System.Web;
using Unity;

namespace EveryAngle.OData.IntegrationTests.Base
{
    public abstract class TestBase
    {
        protected const string AngleNameInOData = "OData_Angle_For_Testing_";

        #region services
        protected Shared.TestContext Context { get; private set; }
        protected AppserverRestService AppServerRestService { get; private set; }
        protected ODataServiceContainer ODataServiceContainer { get; private set; }
        protected ODataService ODataService { get; private set; }
        protected ODataClient ODataClient
        {
            get
            {
                return this.ODataService.Get(Context, string.Empty);
            }
        }
        #endregion


        #region arguments
        public static bool UseCommandLineBaseUriSetting { get; set; }
        public static bool UseCommandLineODataUriSetting { get; set; }
        public static Uri BaseUri { get; set; }
        public static Uri ODataUri { get; set; }
        public static string TestCategories { get; set; }
        public static string Thumbprint { get; set; }
        #endregion


        protected dynamic ODataRole { get; private set; }
        protected dynamic Angle { get; private set; }
        protected dynamic PublishAngle1 { get; private set; }
        protected dynamic PublishAngle2 { get; private set; }
        protected dynamic PrivateAngle { get; private set; }
        protected ODataSettingsViewModel Settings { get; private set; }
        protected dynamic Entry { get; private set; }
        protected ModelInfo Model { get; private set; }

        [SetUp]
        public void BaseSetUp()
        {
            Context = GetTestContext();
            var container = IocContainer.Initialize(Context);

            AppServerRestService = UnityContainerExtensions.Resolve<AppserverRestService>(container);
            ODataService = UnityContainerExtensions.Resolve<ODataService>(container);
            ODataServiceContainer = UnityContainerExtensions.Resolve<ODataServiceContainer>(container);

            GetSettings();
            GetModel();
        }

        [TearDown]
        public void BaseTearDown()
        {
            ODataClient.ClearMetadataCache();
            DeleteODataRole();
        }

        protected void DeleteByUri(object uri)
        {
            var response = AppServerRestService.Delete(Context, $"{uri}?redirect=false");
            Assert.AreEqual(HttpStatusCode.NoContent, response.StatusCode);
        }

        #region Setup User/Role

        protected void SetUpODataUser()
        {
            DeleteExistingODataRole();
            CreateODataRole();
            AssignODataRoleToUser();
        }

        protected void CreateODataRole()
        {
            string body = File.ReadAllText(Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "TestResources", "Role", "OdataRole.json"));
            IRestResponse response = AppServerRestService.Post(Context, "system/roles?redirect=false", body);
            Assert.AreEqual(HttpStatusCode.Created, response.StatusCode);
            ODataRole = JsonConvert.DeserializeObject<dynamic>(response.Content);
        }

        protected void AssignODataRoleToUser()
        {
            IRestResponse response = AppServerRestService.Get(Context, $"users?q={Context.OdataUser.UserName}");
            Assert.That(response.StatusCode, Is.EqualTo(HttpStatusCode.OK));
            JObject users = JsonConvert.DeserializeObject<JObject>(response.Content);
            Assert.AreEqual(1, users.SelectToken("header").SelectToken("total").Value<int>());
            JObject user = users.SelectToken("users")[0] as JObject;
            JArray userRoles = user["assigned_roles"] as JArray;
            //User should have only SYSTEM_ALL
            Assert.AreEqual(1, userRoles.Count);
            Assert.AreEqual("SYSTEM_ALL", userRoles[0].SelectToken("role_id").ToString());
            userRoles.Add(JObject.Parse("{\"role_id\":\"" + ODataRole.id + "\",\"model_id\":\"" + ODataRole.model_authorization.model_id + "\"}"));
            response = AppServerRestService.Put(Context, $"{user.SelectToken("uri").ToString()}?redirect=false", JsonConvert.SerializeObject(user));
            Assert.AreEqual(HttpStatusCode.OK, response.StatusCode);

            //Verify the new role is assigned
            user = JsonConvert.DeserializeObject<JObject>(response.Content);
            userRoles = user["assigned_roles"] as JArray;
            Assert.AreEqual(2, userRoles.Count);
        }

        protected void DeleteExistingODataRole()
        {
            var response = AppServerRestService.Get(Context, $"system/roles?fq=facetcat_models:{Model.id}&ids=OdataRole");
            Assert.AreEqual(HttpStatusCode.OK, response.StatusCode);
            var content = JObject.Parse(response.Content);
            var roles = content.roles as JArray;

            foreach (var role in roles)
            {
                DeleteByUri(role["uri"].ToString());
            }
        }

        protected void DeleteODataRole()
        {
            if (ODataRole != null)
            {
                DeleteByUri(ODataRole.uri);
                ODataRole = null;
            }
        }

        #endregion Setup User/Role

        #region Settings
        protected void GetSettings()
        {
            Settings = ODataServiceContainer.Settings.Get().Result;
        }
        #endregion Settings

        #region Model
        protected void GetModel()
        {
            IRestResponse responseGet = AppServerRestService.Get(Context, "models");
            Assert.AreEqual(HttpStatusCode.OK, responseGet.StatusCode);
            string modelid = (string)Settings.model_id;
            DTO.Models responseModels = JsonConvert.DeserializeObject<DTO.Models>(responseGet.Content);
            Model = responseModels.models.FirstOrDefault(x => x.id.ToLowerInvariant().Equals(modelid.ToLowerInvariant(), StringComparison.InvariantCultureIgnoreCase));
        }
        #endregion Model

        #region Setup Angle
        protected void CreatePublishedAngle()
        {
            Angle = CreateAngleByJsonFile("AngleWith3TypeDisplay.json");
        }

        protected void Create2PublishedAngle()
        {
            PublishAngle1 = CreateAngleByJsonFile("PublishAngle1.json");
            PublishAngle2 = CreateAngleByJsonFile("PublishAngle2.json");
        }

        protected void CreatePrivateAngle()
        {
            PrivateAngle = CreateAngleByJsonFile("PrivateAngle.json");
        }

        protected dynamic CreateAngleByJsonFile(string filename)
        {
            string body = File.ReadAllText(Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "TestResources", "Angle", filename));
            IRestResponse response = AppServerRestService.Post(Context, $"{Model.uri}/angles?redirect=false", body);
            Assert.AreEqual(HttpStatusCode.Created, response.StatusCode);
            return JsonConvert.DeserializeObject<dynamic>(response.Content);
        }

        protected void DeleteExistingAngles()
        {
            var response = AppServerRestService.Get(Context, $"{Model.uri}/angles?ids=odata_*");
            Assert.AreEqual(HttpStatusCode.OK, response.StatusCode);
            var content = JObject.Parse(response.Content);
            var angles = content.angles as JArray;
            if (angles.Any())
            {
                foreach (var angle in angles)
                {
                    DeleteByUri(angle["uri"].ToString());
                }
            }
        }

        protected void UpdateODataSettings(ODataSettingsViewModel viewModel)
        {
            string payload = JsonConvert.SerializeObject(viewModel);
            var response = ODataServiceContainer.Settings.Put(payload);
            Assert.AreEqual(HttpStatusCode.OK, response.Response.StatusCode);
        }

        protected void DeleteAllAngles()
        {
            if (Angle != null)
            {
                DeleteByUri(Angle.uri);
                Angle = null;
            }
            if (PublishAngle1 != null)
            {
                DeleteByUri(PublishAngle1.uri);
                PublishAngle1 = null;
            }
            if (PublishAngle2 != null)
            {
                DeleteByUri(PublishAngle2.uri);
                PublishAngle2 = null;
            }
            if (PrivateAngle != null)
            {
                DeleteByUri(PrivateAngle.uri);
                PrivateAngle = null;
            }
        }

        protected void Delete2PublishedAngle()
        {
            if (PublishAngle1 != null)
            {
                DeleteByUri(PublishAngle1.uri);
                PublishAngle1 = null;
            }
            if (PublishAngle2 != null)
            {
                DeleteByUri(PublishAngle2.uri);
                PublishAngle2 = null;
            }
        }

        #endregion Setup Angle

        #region Entry
        protected void GetEntry()
        {
            string config = JsonConvert.SerializeObject(new
            {
                take = 50,
                skip = 0,
                page = 1,
                pageSize = 50
            });

            Entry = ODataServiceContainer.Entry.GetByQueryStringParameter(config).Result;
        }
        #endregion Entry

        #region Sync Metadata
        protected void SyncMetadata()
        {
            TimeSpan waitingTime = new TimeSpan(0, 0, 2);
            bool isSyning = false;
            Clients.RestResponseResultContainer<dynamic> responsePost;
            Stopwatch stopwatch = new Stopwatch();
            stopwatch.Start();
            do
            {
                responsePost = ODataServiceContainer.SyncMetadata.Post("{sync: true}");
                isSyning = responsePost.Response.StatusCode == HttpStatusCode.Conflict;

                if (!isSyning)
                    break;

                Thread.Sleep(waitingTime);
            }
            while (stopwatch.Elapsed < new TimeSpan(0, 4, 0));
            Assert.AreEqual(HttpStatusCode.OK, responsePost.Response.StatusCode);

            dynamic metadata = ODataServiceContainer.SyncMetadata.Get().Result;

            stopwatch.Restart();
            do
            {
                if (!(bool)metadata.is_running)
                {
                    break;
                }
                Thread.Sleep(waitingTime);

                metadata = ODataServiceContainer.SyncMetadata.Get().Result;
            } while (stopwatch.Elapsed < new TimeSpan(0, 4, 0));

            stopwatch.Stop();
            Assert.IsFalse((bool)metadata.is_running);
        }
        #endregion

        #region private

        private Shared.TestContext GetTestContext()
        {
            if (!UseCommandLineBaseUriSetting)
            {
                var baseUriSetting = ConfigurationManager.AppSettings["BaseUri"];
                if (!String.IsNullOrEmpty(baseUriSetting))
                    BaseUri = new Uri(baseUriSetting);
            }

            if (!UseCommandLineODataUriSetting)
            {
                var oDataUriSetting = ConfigurationManager.AppSettings["ODataUri"];
                if (!String.IsNullOrEmpty(oDataUriSetting))
                    ODataUri = new Uri(oDataUriSetting);
            }

            return new Shared.TestContext
            {
                BaseUri = BaseUri,
                ODataUri = ODataUri,
                Thumbprint = Thumbprint,
                AdminUser = new Models.User("eaadmin", "P@ssw0rd"),
                OdataUser = new Models.User("odatauser", "P@ssw0rd")
            };
        }

        #endregion
    }
}