using EveryAngle.OData.IntegrationTests.Base.TestCategory;
using NUnit.Framework;
using System.Linq;
using Newtonsoft.Json;
using System.Collections.Generic;
using Microsoft.Data.Edm;
using Newtonsoft.Json.Linq;
using System;
using EveryAngle.OData.ViewModel.Settings;

namespace EveryAngle.OData.IntegrationTests.Tests.Setup
{
    [TestFixture]
    public class AngleTest : AcceptanceSuite
    {
        private const int TotalDisplaysExpected = 3;

        #region Initial

        [SetUp]
        public void Setup()
        {
            DeleteExistingAngles();
            CreatePublishedAngle();
            SetUpODataUser();
        }

        [TearDown]
        public void TearDown()
        {
            UpdateODataSettings(Settings);
            DeleteAllAngles();
        }

        #endregion

        #region Tests

        [Test]
        public void OnlyPublishedAngleAndDisplaysShouldBeSynced()
        {
            CreatePrivateAngle();

            SyncMetadata();

            var entitySets = GetEdmEntitySetsExpected(AngleNameInOData);

            Assert.AreEqual(TotalDisplaysExpected, entitySets.Count());
        }

        [Test]
        public void UpdatesOnAngleAndDisplayNamesAreSynced()
        {
            var newAngleNameInOData = $"{AngleNameInOData}Edited_";
            var updatedAngle = new
            {
                name = newAngleNameInOData.Replace("_", " ").Trim()
            };

            AppServerRestService.Put(Context, Angle.uri.ToString(), JsonConvert.SerializeObject(updatedAngle));

            SyncMetadata();

            var entitySets = GetEdmEntitySetsExpected(newAngleNameInOData);

            Assert.AreEqual(TotalDisplaysExpected, entitySets.Count());
        }

        [Test]
        public void DeletedAngleAndDisplaysAreRemoved()
        {
            AppServerRestService.Delete(Context, Angle.uri.ToString());

            SyncMetadata();

            var entitySets = GetEdmEntitySetsExpected(AngleNameInOData);

            Assert.AreEqual(0, entitySets.Count());
        }

        [Test]
        public void GetFieldValuesCorrect()
        {
            var resultPayload = new
            {
                query_definition = new List<object>
                {
                    new { base_angle = Angle.uri, queryblock_type = "base_angle" },
                    new { base_display = Angle.angle_default_display, queryblock_type = "base_display" }
                }
            };
            var response1 = AppServerRestService.Post(Context, "results?redirect=no", JsonConvert.SerializeObject(resultPayload));
            dynamic postResult = JsonConvert.DeserializeObject<dynamic>(response1.Content);
            var dataFields = JsonConvert.DeserializeObject<string[]>(postResult.default_fields.ToString());

            var response2 = AppServerRestService.Get(Context, postResult.uri.ToString());
            dynamic result = JsonConvert.DeserializeObject<dynamic>(response2.Content);

            var response3 = AppServerRestService.Get(Context, $"{result.data_rows.ToString()}?offset=0&limit=1&fields={string.Join(",", dataFields)}");
            dynamic datarows = JsonConvert.DeserializeObject<dynamic>(response3.Content);
            JArray rows = JArray.Parse(datarows.rows.ToString());

            SyncMetadata();

            string entitySetName = GetEdmEntitySetName(Angle);
            var odataEntry = ODataClient.For(entitySetName).Top(1).FindEntryAsync().GetAwaiter().GetResult();

            string[] fieldNames = JsonConvert.DeserializeObject<string[]>(datarows.fields.ToString());
            string[] fieldValues = JsonConvert.DeserializeObject<string[]>(rows[0]["field_values"].ToString());
            var appserverDataRow = fieldNames.Select((x, i) => new KeyValuePair<string, object>(x, fieldValues[i])).ToDictionary(x => x.Key);

            foreach (var odataField in odataEntry)
            {
                var appserverFieldValueAsString = appserverDataRow[odataField.Key].Value.ToString();
                var odataFieldValueAsString = odataField.Value.ToString();

                if (DateTime.TryParse(odataField.Value.ToString(), out DateTime datetimeFieldValue))
                    appserverFieldValueAsString = new DateTime(1970, 1, 1, 0, 0, 0, DateTimeKind.Utc).AddSeconds(Double.Parse(appserverFieldValueAsString)).ToString("yyyy-MM-dd HH:mm:ss");

                Assert.AreEqual(appserverFieldValueAsString, odataFieldValueAsString);
            }

        }

        [Test]
        public void AngleQueryIsAppliedWhenSyncingAngles()
        {
            UpdateODataSettings(new ODataSettingsViewModel
            {
                angles_query = "facetcat_bp:(S2D) AND facetcat_itemtype:(facet_angle)&ids=OData_a160f3ccf5f20dddf679f574327518287"
            });

            SyncMetadata();

            var edmEntitySets = GetEdmEntitySets();
            Assert.AreEqual(TotalDisplaysExpected, edmEntitySets.Count());
        }

        [Test]
        public void PageSizeIsAppliedWhenSyncingAngles()
        {
            int totalDisplayBeforeUpdate = GetEdmEntitySets().Count();
            UpdateODataSettings(new ODataSettingsViewModel
            {
                page_size = 5
            });

            SyncMetadata();

            var edmEntitySets = GetEdmEntitySets();
            Assert.AreEqual(totalDisplayBeforeUpdate, edmEntitySets.Count());
        }

        [TestCase(1, 1)]
        [TestCase(3, 3)]
        public void MaxAnglesIsAppliedWhenSyncingAngles(int maxangles, int expected)
        {
            Create2PublishedAngle();
            UpdateODataSettings(new ODataSettingsViewModel
            {
                max_angles = maxangles
            });

            SyncMetadata();

            GetEntry();
            Assert.AreEqual(expected, (int)Entry.result.Count);
            Delete2PublishedAngle();
        }

        #endregion

        #region private

        private IEnumerable<IEdmEntitySet> GetEdmEntitySets()
        {
            var metadata = ODataClient.GetMetadataAsync<IEdmModel>().GetAwaiter().GetResult();
            var edmEntitySets = metadata.FindEntityContainer("DefaultContainer")?.EntitySets() ?? new List<IEdmEntitySet>();
            return edmEntitySets;
        }

        private IEnumerable<IEdmEntitySet> GetEdmEntitySetsExpected(string beginningStringOfEntityName)
        {
            var edmEntitySets = GetEdmEntitySets();
            var actualEntitySets = edmEntitySets.Where(x => x.Name.ToString().StartsWith(beginningStringOfEntityName));

            return actualEntitySets;
        }

        private string GetEdmEntitySetName(dynamic angle)
        {
            var angleId = ((string)angle.uri).Split('/').Last();
            var displayId = ((string)angle.angle_default_display).Split('/').Last();

            var edmEntitySets = GetEdmEntitySets();
            var edmEntitySetName = edmEntitySets.FirstOrDefault(x => x.ElementType.ToString().Equals($"EA.{angleId}_{displayId}"))?.Name;
            Assert.IsNotNull(edmEntitySetName);

            return edmEntitySetName;
        }

        #endregion

    }
}
