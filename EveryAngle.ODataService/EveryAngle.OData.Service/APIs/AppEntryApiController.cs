using EveryAngle.OData.BusinessLogic.EdmBusinessLogics;
using EveryAngle.OData.BusinessLogic.Interfaces;
using EveryAngle.OData.DTO;
using EveryAngle.OData.Settings;
using EveryAngle.OData.Utils;
using EveryAngle.OData.ViewModel;
using EveryAngle.OData.ViewModel.Settings;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Web.Http;

namespace EveryAngle.OData.Service.APIs
{
    [RoutePrefix("api")]
    public class AppEntryApiController : BaseApiController
    {
        private readonly IMasterEdmModelBusinessLogic _edmBusinessLogic;

        public AppEntryApiController(IMasterEdmModelBusinessLogic edmBusinessLogic)
        {
            _edmBusinessLogic = edmBusinessLogic;
        }

        [Route("entry")]
        public HttpResponseMessage Get()
        {
            List<EntryEntitiesViewModel> entities = new List<EntryEntitiesViewModel>();
            KendoUIGridQueryViewModel query = GetQueryArgsAsViewModel<KendoUIGridQueryViewModel>();
            int pageSize = 0;
            if (query != null)
            {
                if (!query.id.HasValue)
                {
                    IEnumerable<Angle> angles = _edmBusinessLogic.GetAvailableAngles();

                    angles = DetermineFiltering(query, angles);
                    angles = DetermineSorting(query, angles);
                    entities.AddRange(angles.Skip(query.skip).Take(query.take).Select(x => new EntryEntitiesViewModel(x, ODataSettings.Settings.WebClientUri)));
                }
                else
                {
                    if (_edmBusinessLogic.TryGetAngle(Extensions.GetAngleCompositeKey(query.id.Value), out Angle angle))
                    {
                        // Using proper linq, expected angle's display should not exceeded than 100?
                        entities.AddRange(angle.AvailableDisplays.Select(display =>
                            new EntryEntitiesViewModel(display, ODataSettings.Settings.WebClientUri)));
                    }
                }
                pageSize = _edmBusinessLogic.CountAvailableAngles();
            }

            return CreateResponse(new { result = entities, page_size = pageSize });
        }

        private IEnumerable<Angle> DetermineFiltering(KendoUIGridQueryViewModel query, IEnumerable<Angle> angles)
        {
            IEnumerable<Angle> filteredAngles = angles;
            if (query.filter != null && query.filter.filters.Any())
            {
                SubFilterQueryViewModel filter = query.filter.filters[0];
                filteredAngles = filteredAngles.Where(x => x.name.ToLowerInvariant().Contains(filter.value.ToLowerInvariant())).ToList();
            }

            return filteredAngles;
        }
        private IEnumerable<Angle> DetermineSorting(KendoUIGridQueryViewModel query, IEnumerable<Angle> angles)
        {
            IEnumerable<Angle> sortedAngles = angles;
            if (query.sort != null && query.sort.Any())
            {
                sortedAngles = query.sort[0].dir == "desc"
                                ? sortedAngles.OrderByDescending(x => x.name).ToList()
                                : sortedAngles.OrderBy(x => x.name).ToList();
            }

            return sortedAngles;
        }
    }
}