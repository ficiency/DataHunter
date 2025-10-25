class SitesConfig {
    constructor() {
        // US States abbreviations (for reference)
        this.states = {
            'Alabama': 'AL', 'Alaska': 'AK', 'Arizona': 'AZ', 'Arkansas': 'AR',
            'California': 'CA', 'Colorado': 'CO', 'Connecticut': 'CT', 'Delaware': 'DE',
            'Florida': 'FL', 'Georgia': 'GA', 'Hawaii': 'HI', 'Idaho': 'ID',
            'Illinois': 'IL', 'Indiana': 'IN', 'Iowa': 'IA', 'Kansas': 'KS',
            'Kentucky': 'KY', 'Louisiana': 'LA', 'Maine': 'ME', 'Maryland': 'MD',
            'Massachusetts': 'MA', 'Michigan': 'MI', 'Minnesota': 'MN', 'Mississippi': 'MS',
            'Missouri': 'MO', 'Montana': 'MT', 'Nebraska': 'NE', 'Nevada': 'NV',
            'New Hampshire': 'NH', 'New Jersey': 'NJ', 'New Mexico': 'NM', 'New York': 'NY',
            'North Carolina': 'NC', 'North Dakota': 'ND', 'Ohio': 'OH', 'Oklahoma': 'OK',
            'Oregon': 'OR', 'Pennsylvania': 'PA', 'Rhode Island': 'RI', 'South Carolina': 'SC',
            'South Dakota': 'SD', 'Tennessee': 'TN', 'Texas': 'TX', 'Utah': 'UT',
            'Vermont': 'VT', 'Virginia': 'VA', 'Washington': 'WA', 'West Virginia': 'WV',
            'Wisconsin': 'WI', 'Wyoming': 'WY'
        };

        this.peopleSearchSites = [
            {
                name: 'Addresses',
                baseUrl: 'https://www.addresses.com',
                buildUrl: (query, state = null) => {
                    // Format: john+doe/az/
                    const formatted = query.trim().toLowerCase().replace(/\s+/g, '+');
                    
                    if (state) {
                        // Con estado (recomendado para mejores resultados)
                        const stateCode = this.getStateCode(state).toLowerCase();
                        return `https://www.addresses.com/people/${formatted}/${stateCode}/`;
                    } else {
                        // Sin estado (busca en todos)
                        return `https://www.addresses.com/people/${formatted}/`;
                    }
                },
                enabled: true,
                priority: 1,
            },
            {
                name: '411',
                baseUrl: 'https://www.411.com',
                buildUrl: (query, state = null, city = null) => {
                    // Format: /person-search/John-Doe/CA/San+Ramon
                    const parts = query.trim().split(' ');
                    const firstName = parts[0] || '';
                    const lastName = parts.slice(1).join('-') || '';
                    
                    const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
                    const formattedName = `${capitalize(firstName)}-${capitalize(lastName)}`;
                    
                    let url = `https://www.411.com/person-search/${formattedName}`;
                    
                    if (state) {
                        const stateCode = this.getStateCode(state).toUpperCase();
                        url += `/${stateCode}`;
                        
                        if (city) {
                            const formattedCity = city.trim().replace(/\s+/g, '+');
                            url += `/${formattedCity}`;
                        }
                    }
                    
                    return url;
                },
                enabled: true,
                priority: 2,
            },
            {
                name: 'Wikipedia',
                baseUrl: 'https://en.wikipedia.org',
                buildUrl: (query) => {
                    const formatted = query.trim().replace(/\s+/g, '_');
                    return `https://en.wikipedia.org/wiki/${encodeURIComponent(formatted)}`;
                },
                enabled: true,
                priority: 3,
            },
        ];

        this.scanConfig = {
            maxUrlsPerScan: 4,
            delayBetweenUrls: 2000,
            timeout: 30000,
            retryFailed: true,
        };
    }

    // Helper: Get state code (handles full name or abbreviation)
    getStateCode(state) {
        if (!state) return '';
        
        const upperState = state.trim().toUpperCase();
        
        // If already 2-letter code
        if (upperState.length === 2) {
            return upperState;
        }
        
        // Find by full name
        const stateEntry = Object.entries(this.states).find(
            ([name, code]) => name.toUpperCase() === upperState
        );
        
        return stateEntry ? stateEntry[1] : '';
    }

    getEnabledSites() {
        return this.peopleSearchSites
            .filter(site => site.enabled)
            .sort((a, b) => a.priority - b.priority);
    }

    // Updated to support state and city parameters
    generateUrls(targetName, options = {}) {
        const { limit = null, state = null, city = null } = options;
        const enabledSites = this.getEnabledSites();
        const maxUrls = limit || this.scanConfig.maxUrlsPerScan;

        return enabledSites.slice(0, maxUrls).map(site => ({
            url: site.buildUrl(targetName, state, city),
            siteName: site.name,
            priority: site.priority,
        }));
    }

    getScanConfig() {
        return { ...this.scanConfig };
    }

    toggleSite(siteName, enabled) {
        const site = this.peopleSearchSites.find(s => s.name === siteName);
        if (site) {
            site.enabled = enabled;
            return true;
        }
        return false;
    }

    getSite(siteName) {
        return this.peopleSearchSites.find(s => s.name === siteName);
    }
}

module.exports = SitesConfig;