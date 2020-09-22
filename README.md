---
page_type: sample
description: An Azure Maps Web SDK module that provides controls for selecting data in a data source using drawing tools or by requesting a route range polygon.
languages:
- javascript
- typescript
products:
- azure
- azure-maps
---

# Azure Maps Selection Control module

An Azure Maps Web SDK module that provides controls for selecting data in a data source using drawing tools or by requesting a route range polygon.

This module requires the Azure Maps drawing tools module to also be loaded in the app. 

**Samples**

[Selection control](https://azuremapscodesamples.azurewebsites.net/?sample=Selection%20control)
<br/>[<img src="https://github.com/Azure-Samples/AzureMapsCodeSamples/raw/master/AzureMapsCodeSamples/SiteResources/screenshots/Selection-control.jpg" height="200px">](https://azuremapscodesamples.azurewebsites.net/?sample=Selection%20control)

[Route range control](https://azuremapscodesamples.azurewebsites.net/?sample=Route%20range%20control)
<br/>[<img src="https://github.com/Azure-Samples/AzureMapsCodeSamples/raw/master/AzureMapsCodeSamples/SiteResources/screenshots/Route-range-control.jpg" height="200px">](https://azuremapscodesamples.azurewebsites.net/?sample=Route%20range%20control)


## Getting started

Download the project and copy the `azure-maps-selection-control` JavaScript and CSS files from the `dist` folder into your project and add references to these in your code. 

```HTML
<!-- Add references to the Azure Maps Map control JavaScript and CSS files. -->
<link rel="stylesheet" href="https://atlas.microsoft.com/sdk/javascript/mapcontrol/2/atlas.min.css" type="text/css" />
<script src="https://atlas.microsoft.com/sdk/javascript/mapcontrol/2/atlas.min.js"></script>

<!-- Add references to the Azure Maps Map Drawing Tools JavaScript and CSS files. -->
<link rel="stylesheet" href="https://atlas.microsoft.com/sdk/javascript/drawing/0/atlas-drawing.min.css" type="text/css" />
<script src="https://atlas.microsoft.com/sdk/javascript/drawing/0/atlas-drawing.min.js"></script>

<!-- Add references to the Azure Maps Selection Control module JavaScript and CSS files. -->
<link  rel="stylesheet" href="../dist/azure-maps-selection-control.min.css" type="text/css"/>
<script src="../dist/azure-maps-selection-control.min.js"></script>
```

Check out the [documentation](https://github.com/Azure-Samples/azure-maps-selection-control/tree/master/docs) for more information.

## Roadmap

- Consider splitting the route range control into its own module.
- Add option to add controls to other containers (i.e. outside the map).

## Related Projects

**Open Azure Maps Web SDK modules**

* [Azure Maps Animation module](https://github.com/Azure-Samples/azure-maps-animations)
* [Azure Maps Geolocation Control module](https://github.com/Azure-Samples/azure-maps-geolocation-control)
* [Azure Maps Fullscreen Control module](https://github.com/Azure-Samples/azure-maps-fullscreen-control)
* [Azure Maps Sync Map module](https://github.com/Azure-Samples/azure-maps-sync-maps)
* [Azure Maps Services UI module](https://github.com/Azure-Samples/azure-maps-services-ui)

**Additional projects**

* [Azure Maps Web SDK Samples](https://github.com/Azure-Samples/AzureMapsCodeSamples)
* [Azure Maps Gov Cloud Web SDK Samples](https://github.com/Azure-Samples/AzureMapsGovCloudCodeSamples)
* [Azure Maps & Azure Active Directory Samples](https://github.com/Azure-Samples/Azure-Maps-AzureAD-Samples)
* [List of open-source Azure Maps projects](https://github.com/microsoft/Maps/blob/master/AzureMaps.md)

## Additional Resources

* [Azure Maps (main site)](https://azure.com/maps)
* [Azure Maps Documentation](https://docs.microsoft.com/azure/azure-maps/index)
* [Azure Maps Blog](https://azure.microsoft.com/blog/topics/azure-maps/)
* [Microsoft Q&A](https://docs.microsoft.com/answers/topics/azure-maps.html)
* [Azure Maps feedback](https://feedback.azure.com/forums/909172-azure-maps)

## Contributing

We welcome contributions. Feel free to submit code samples, file issues and pull requests on the repo and we'll address them as we can. 
Learn more about how you can help on our [Contribution Rules & Guidelines](https://github.com/Azure-Samples/azure-maps-selection-control/blob/main/CONTRIBUTING.md). 

You can reach out to us anytime with questions and suggestions using our communities below:
* [Microsoft Q&A](https://docs.microsoft.com/answers/topics/azure-maps.html)
* [Azure Maps feedback](https://feedback.azure.com/forums/909172-azure-maps)

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/). 
For more information, see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or 
contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.

## License

MIT
 
See [License](https://github.com/Azure-Samples/azure-maps-selection-control/blob/main/LICENSE.md) for full license text.
