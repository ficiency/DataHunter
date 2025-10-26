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
            {
                name: 'TruePeopleSearch',
                baseUrl: 'https://www.truepeoplesearch.com',
                buildUrl: (query, state = null) => {
                    const formatted = encodeURIComponent(query.trim());
                    let url = `https://www.truepeoplesearch.com/results?name=${formatted}`;
                    
                    if (state) {
                        const stateCode = this.getStateCode(state).toUpperCase();
                        url += `&citystatezip=${stateCode}`;
                    }
                    return url;
                },
                enabled: true,
                priority: 1,
            },
            {
                name: 'FastPeopleSearch',
                baseUrl: 'https://www.fastpeoplesearch.com',
                buildUrl: (query, state = null) => {
                    const formatted = query.trim().toLowerCase().replace(/\s+/g, '-');
                    let url = `https://www.fastpeoplesearch.com/name/${formatted}`;
                    
                    if (state) {
                        const stateCode = this.getStateCode(state).toUpperCase();
                        url += `_${stateCode}`;
                    }
                    return url;
                },
                enabled: true,
                priority: 1,
            },
            {
                name: 'WhitePages',
                baseUrl: 'https://www.whitepages.com',
                buildUrl: (query, state = null) => {
                    const parts = query.trim().split(' ');
                    const formatted = parts.map(p => 
                        p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()
                    ).join('-');
                    
                    let url = `https://www.whitepages.com/name/${formatted}`;
                    
                    if (state) {
                        const stateName = Object.keys(this.states).find(
                            key => this.states[key] === state.toUpperCase()
                        ) || state;
                        url += `/${stateName.replace(/\s+/g, '-')}`;
                    }
                    return url;
                },
                enabled: true,
                priority: 2,
            },
            {
                name: 'AnyWho',
                baseUrl: 'https://www.anywho.com',
                buildUrl: (query, state = null) => {
                    const formatted = query.trim().toLowerCase().replace(/\s+/g, '+');
                    let url = `https://www.anywho.com/people/${formatted}`;
                    
                    if (state) {
                        const stateCode = this.getStateCode(state).toLowerCase();
                        url += `/${stateCode}`;
                    }
                    return url;
                },
                enabled: true,
                priority: 2,
            },
            {
                name: 'PeekYou',
                baseUrl: 'https://www.peekyou.com',
                buildUrl: (query, state = null) => {
                    const formatted = query.trim().toLowerCase().replace(/\s+/g, '_');
                    
                    if (state) {
                        const stateName = Object.keys(this.states).find(
                            key => this.states[key] === state.toUpperCase()
                        );
                        if (stateName) {
                            const stateFormatted = stateName.toLowerCase().replace(/\s+/g, '');
                            return `https://www.peekyou.com/usa/${stateFormatted}/${formatted}`;
                        }
                    }
                    return `https://www.peekyou.com/${formatted}`;
                },
                enabled: true,
                priority: 2,
            },
            {
                name: 'Radaris',
                baseUrl: 'https://radaris.com',
                buildUrl: (query, state = null) => {
                    const parts = query.trim().split(' ');
                    const firstName = parts[0] ? parts[0].charAt(0).toUpperCase() + parts[0].slice(1).toLowerCase() : '';
                    const lastName = parts.slice(1).join(' ');
                    const lastFormatted = lastName ? lastName.charAt(0).toUpperCase() + lastName.slice(1).toLowerCase() : '';
                    
                    if (state) {
                        const stateCode = this.getStateCode(state).toUpperCase();
                        return `https://radaris.com/ng/search?ff=${firstName}&fl=${lastFormatted}&fs=${stateCode}`;
                    }
                    return `https://radaris.com/p/${firstName}/${lastFormatted}/`;
                },
                enabled: true,
                priority: 2,
            },
            {
                name: 'ThatsThem',
                baseUrl: 'https://thatsthem.com',
                buildUrl: (query, state = null) => {
                    const formatted = query.trim().toLowerCase().replace(/\s+/g, '-');
                    let url = `https://thatsthem.com/name/${formatted}`;
                    
                    if (state) {
                        const stateName = Object.keys(this.states).find(
                            key => this.states[key] === state.toUpperCase()
                        );
                        if (stateName) {
                            url += `/${stateName.toLowerCase().replace(/\s+/g, '-')}`;
                        }
                    }
                    return url;
                },
                enabled: true,
                priority: 2,
            },
            {
                name: 'USPhoneBook',
                baseUrl: 'https://www.usphonebook.com',
                buildUrl: (query, state = null) => {
                    const formatted = query.trim().replace(/\s+/g, '-');
                    let url = `https://www.usphonebook.com/${formatted}`;
                    
                    if (state) {
                        const stateCode = this.getStateCode(state).toUpperCase();
                        url += `/${stateCode}`;
                    }
                    return url;
                },
                enabled: true,
                priority: 2,
            },
            {
                name: 'Webmii',
                baseUrl: 'https://webmii.com',
                buildUrl: (query, state = null) => {
                    const formatted = encodeURIComponent(`"${query.trim()}"`);
                    let url = `https://webmii.com/people?n=${formatted}`;
                    
                    if (state) {
                        url += `&l=${state.toUpperCase()}`;
                    }
                    return url;
                },
                enabled: true,
                priority: 2,
            },
            {
                name: 'Zabasearch',
                baseUrl: 'https://www.zabasearch.com',
                buildUrl: (query, state = null) => {
                    const formatted = query.trim().replace(/\s+/g, '+');
                    let url = `https://www.zabasearch.com/people/${formatted}`;
                    
                    if (state) {
                        const stateCode = this.getStateCode(state).toLowerCase();
                        url += `/${stateCode}/`;
                    }
                    return url;
                },
                enabled: true,
                priority: 2,
            },
            {
                name: 'PeopleFinders',
                baseUrl: 'https://www.peoplefinders.com',
                buildUrl: (query, state = null) => {
                    const formatted = query.trim().toLowerCase().replace(/\s+/g, '-');
                    let url = `https://www.peoplefinders.com/people/${formatted}`;
                    
                    if (state) {
                        const stateName = Object.keys(this.states).find(
                            key => this.states[key] === state.toUpperCase()
                        );
                        if (stateName) {
                            url += `/${stateName.toLowerCase().replace(/\s+/g, '-')}`;
                        }
                    }
                    return url;
                },
                enabled: true,
                priority: 2,
            },
            {
                name: 'Spokeo',
                baseUrl: 'https://www.spokeo.com',
                buildUrl: (query, state = null) => {
                    const parts = query.trim().split(' ');
                    const formatted = parts.map(p => 
                        p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()
                    ).join('-');
                    
                    let url = `https://www.spokeo.com/${formatted}`;
                    
                    if (state) {
                        const stateName = Object.keys(this.states).find(
                            key => this.states[key] === state.toUpperCase()
                        );
                        if (stateName) {
                            url += `/${stateName.replace(/\s+/g, '-')}`;
                        }
                    }
                    return url;
                },
                enabled: true,
                priority: 2,
            },
        ];

        this.scanConfig = {
            maxUrlsPerScan: 15, // Scan all 15 sites
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