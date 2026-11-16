export interface MarketReport {
  id: string
  country: string
  topic: string
  date: string
  source: string
  summary: string
  details: string
  keywords: string[]
  regions: string[]
}

export const marketReports: MarketReport[] = [
  {
    id: "br-climate-20240318",
    country: "Brazil",
    topic: "Climate",
    date: "2024-03-18",
    source: "National Bioenergy Union",
    summary: "Rains are expected to remain concentrated in the North and Northeast regions.",
    details:
      "For the next seven days, the Cosmo numerical model of the National Institute of Meteorology (INMET) indicates concentrated rainfall in the North and Northeast regions. The Central-West, Southeast, and South regions should have little rainfall, which favors the sugarcane harvest. The forecast indicates that the rains will be more concentrated in the North and Northeast regions of the country, with accumulated rainfall above 100 mm in some locations.",
    keywords: ["rain", "climate", "production", "forecast"],
    regions: ["North", "Northeast", "Central-West", "Southeast", "South"],
  },
  {
    id: "br-regulation-20240317",
    country: "Brazil",
    topic: "Regulation",
    date: "2024-03-17",
    source: "Novacana",
    summary: "Government to increase ethanol blend in gasoline to 30% this year.",
    details:
      "The Ministry of Mines and Energy will present this Monday, the 17th, a study it commissioned to assess the impacts of increasing the percentage of anhydrous ethanol in gasoline from the current 27% to 30%. The expectation is that the increase will be implemented this year, as part of the government's strategy to reduce carbon emissions and boost the biofuels sector.",
    keywords: ["ethanol", "gasoline", "regulation", "policy"],
    regions: [],
  },
  {
    id: "in-export-20240311",
    country: "India",
    topic: "Exportation and production",
    date: "2024-03-11",
    source: "The New Indian express",
    summary:
      "India has so far exported its major share of sugar to Sri Lanka and Afghanistan despite growing concerns over the possibility of reduced domestic production.",
    details:
      "India has so far exported its major share of sugar to Sri Lanka and Afghanistan despite growing concerns over the possibility of reduced domestic production leading to higher sugar prices in domestic consumers in coming months. According to the All India Sugar Trade Association (AISTA), as of March 11, India has exported approximately 41% of its sugar to Sri Lanka and over 22% to Afghanistan, out of 81.307K MT of white, raw, and refined sugar. An additional 70K MT of sugar are waiting to be loaded for export. \"Neighbouring countries prefer India's sugar due to lower freight costs, immediate delivery, and higher sucrose content,\" stated Praful Vithlani, Chairman of AISTA. Meanwhile, the export of sugar amid a dip in overall sugar production has raised the alarm among policymakers. According to experts, the Government decision was based on an 'inflated' figure of sugar production. The National Federation of Cooperative Sugar Factories Limited (NFCSF), the largest federation of sugar mills in the country, estimated that around 19% of sugar was produced less than last year. Currently, NFCSF estimates 25.9M MT of sugar production, as against 32M MT of total sugar production last year.",
    keywords: ["sugar export", "sugar production", "sugar prices", "domestic production", "Sri Lanka", "Afghanistan"],
    regions: ["Sri Lanka", "Afghanistan", "Uttar Pradesh", "Maharashtra", "Karnataka"],
  },
  {
    id: "th-production-20240315",
    country: "Thailand",
    topic: "Production",
    date: "2024-03-15",
    source: "Bangkok Post",
    summary: "Thailand's sugar production expected to drop by 30% due to drought conditions.",
    details:
      "Thailand's sugar production for the 2023/24 season is expected to drop by approximately 30% compared to the previous season due to severe drought conditions affecting major cane-growing regions. The Office of Cane and Sugar Board (OCSB) has revised its production forecast downward to 7.5 million tonnes, compared to 10.7 million tonnes in the previous season. The drought has particularly affected the northeastern and central regions, which account for over 60% of the country's sugarcane production.",
    keywords: ["drought", "production decline", "sugarcane", "forecast"],
    regions: ["Northeast", "Central"],
  },
  {
    id: "eu-prices-20240314",
    country: "European Union",
    topic: "Prices",
    date: "2024-03-14",
    source: "European Commission",
    summary: "EU sugar prices reach five-year high amid global supply concerns.",
    details:
      "Sugar prices in the European Union have reached a five-year high, driven by concerns about global supply shortages and increased production costs. According to the latest data from the European Commission, the average price of white sugar in the EU reached €650 per tonne in February, representing a 15% increase compared to the same period last year. The price surge is attributed to lower production in key producing countries such as Brazil, India, and Thailand, as well as increased energy and input costs for European producers.",
    keywords: ["sugar prices", "supply shortage", "production costs", "market trends"],
    regions: [],
  },
]
