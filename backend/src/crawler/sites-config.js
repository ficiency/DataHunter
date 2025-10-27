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
            {
                name: 'BeenVerified',
                baseUrl: 'https://www.beenverified.com',
                buildUrl: (query, state = null) => {
                    const parts = query.trim().split(' ');
                    const formatted = parts.map(p => p.toLowerCase()).join('-');
                    let url = `https://www.beenverified.com/people/${formatted}`;
                    if (state) {
                        url += `/${state.toLowerCase()}`;
                    }
                    return url;
                },
                enabled: true,
                priority: 2,
            },
            {
                name: 'Intelius',
                baseUrl: 'https://www.intelius.com',
                buildUrl: (query, state = null) => {
                    const formatted = query.trim().replace(/\s+/g, '-').toLowerCase();
                    let url = `https://www.intelius.com/people-search/${formatted}`;
                    if (state) {
                        url += `/${state.toLowerCase()}`;
                    }
                    return url;
                },
                enabled: true,
                priority: 2,
            },
            {
                name: 'InstantCheckmate',
                baseUrl: 'https://www.instantcheckmate.com',
                buildUrl: (query, state = null) => {
                    const parts = query.trim().split(' ');
                    const formatted = parts.join('-').toLowerCase();
                    return `https://www.instantcheckmate.com/people/${formatted}`;
                },
                enabled: true,
                priority: 2,
            },
            {
                name: 'FamilyTreeNow',
                baseUrl: 'https://www.familytreenow.com',
                buildUrl: (query, state = null) => {
                    const parts = query.trim().split(' ');
                    const firstName = parts[0] || '';
                    const lastName = parts.slice(1).join(' ') || '';
                    let url = `https://www.familytreenow.com/search/genealogy/results?first=${firstName}&last=${lastName}`;
                    if (state) {
                        url += `&state=${state.toUpperCase()}`;
                    }
                    return url;
                },
                enabled: true,
                priority: 2,
            },
            {
                name: 'PublicRecordsNow',
                baseUrl: 'https://www.publicrecordsnow.com',
                buildUrl: (query, state = null) => {
                    const formatted = query.trim().replace(/\s+/g, '+');
                    return `https://www.publicrecordsnow.com/search?name=${formatted}`;
                },
                enabled: true,
                priority: 3,
            },
            {
                name: 'NeighborWho',
                baseUrl: 'https://www.neighborwho.com',
                buildUrl: (query, state = null) => {
                    const formatted = query.trim().toLowerCase().replace(/\s+/g, '-');
                    let url = `https://www.neighborwho.com/name/${formatted}`;
                    if (state) {
                        url += `/${state.toLowerCase()}`;
                    }
                    return url;
                },
                enabled: true,
                priority: 2,
            },
            {
                name: 'PeopleSearchNow',
                baseUrl: 'https://www.peoplesearchnow.com',
                buildUrl: (query, state = null) => {
                    const parts = query.trim().split(' ');
                    const formatted = parts.join('-').toLowerCase();
                    let url = `https://www.peoplesearchnow.com/person/${formatted}`;
                    if (state) {
                        url += `-${state.toLowerCase()}`;
                    }
                    return url;
                },
                enabled: true,
                priority: 2,
            },
            {
                name: 'AdvancedBackgroundChecks',
                baseUrl: 'https://www.advancedbackgroundchecks.com',
                buildUrl: (query, state = null) => {
                    const formatted = query.trim().toLowerCase().replace(/\s+/g, '-');
                    let url = `https://www.advancedbackgroundchecks.com/names/${formatted}`;
                    if (state) {
                        url += `/${state.toLowerCase()}`;
                    }
                    return url;
                },
                enabled: true,
                priority: 2,
            },
            {
                name: 'CheckPeople',
                baseUrl: 'https://www.checkpeople.com',
                buildUrl: (query, state = null) => {
                    const formatted = query.trim().replace(/\s+/g, '+');
                    return `https://www.checkpeople.com/search?name=${formatted}`;
                },
                enabled: true,
                priority: 3,
            },
            {
                name: 'USSearch',
                baseUrl: 'https://www.ussearch.com',
                buildUrl: (query, state = null) => {
                    const parts = query.trim().split(' ');
                    const firstName = parts[0] || '';
                    const lastName = parts.slice(1).join(' ') || '';
                    let url = `https://www.ussearch.com/search?firstName=${firstName}&lastName=${lastName}`;
                    if (state) {
                        url += `&state=${state.toUpperCase()}`;
                    }
                    return url;
                },
                enabled: true,
                priority: 2,
            },
            {
                name: 'Nuwber',
                baseUrl: 'https://nuwber.com',
                buildUrl: (query, state = null) => {
                    const parts = query.trim().split(' ');
                    const formatted = parts.map(p => 
                        p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()
                    ).join('-');
                    let url = `https://nuwber.com/search?name=${formatted}`;
                    if (state) {
                        url += `&state=${state.toUpperCase()}`;
                    }
                    return url;
                },
                enabled: true,
                priority: 2,
            },
            {
                name: 'SearchPeopleFree',
                baseUrl: 'https://www.searchpeoplefree.com',
                buildUrl: (query, state = null) => {
                    const parts = query.trim().split(' ');
                    const firstName = parts[0] || '';
                    const lastName = parts.slice(1).join(' ') || '';
                    let url = `https://www.searchpeoplefree.com/find/${firstName}-${lastName}`;
                    if (state) {
                        url += `/${state.toLowerCase()}`;
                    }
                    return url;
                },
                enabled: true,
                priority: 2,
            },
            {
                name: 'Privateeye',
                baseUrl: 'https://www.privateeye.com',
                buildUrl: (query, state = null) => {
                    const formatted = query.trim().replace(/\s+/g, '+');
                    return `https://www.privateeye.com/people/${formatted}`;
                },
                enabled: true,
                priority: 3,
            },
            {
                name: 'InfoTracer',
                baseUrl: 'https://infotracer.com',
                buildUrl: (query, state = null) => {
                    const parts = query.trim().split(' ');
                    const formatted = parts.join('-').toLowerCase();
                    let url = `https://infotracer.com/people/${formatted}`;
                    if (state) {
                        url += `/${state.toLowerCase()}`;
                    }
                    return url;
                },
                enabled: true,
                priority: 2,
            },
            {
                name: 'AddressSearch',
                baseUrl: 'https://www.addresssearch.com',
                buildUrl: (query, state = null) => {
                    const formatted = query.trim().toLowerCase().replace(/\s+/g, '-');
                    return `https://www.addresssearch.com/people/${formatted}`;
                },
                enabled: true,
                priority: 3,
            },
            {
                name: 'TrueCaller',
                baseUrl: 'https://www.truecaller.com',
                buildUrl: (query, state = null) => {
                    const formatted = encodeURIComponent(query.trim());
                    return `https://www.truecaller.com/search/us/${formatted}`;
                },
                enabled: true,
                priority: 3,
            },
            {
                name: 'PeopleSmart',
                baseUrl: 'https://www.peoplesmart.com',
                buildUrl: (query, state = null) => {
                    const formatted = query.trim().toLowerCase().replace(/\s+/g, '-');
                    let url = `https://www.peoplesmart.com/people/${formatted}`;
                    if (state) {
                        url += `/${state.toLowerCase()}`;
                    }
                    return url;
                },
                enabled: true,
                priority: 2,
            },
            {
                name: 'Yasni',
                baseUrl: 'https://www.yasni.com',
                buildUrl: (query, state = null) => {
                    const formatted = query.trim().replace(/\s+/g, '+');
                    return `https://www.yasni.com/${formatted}`;
                },
                enabled: true,
                priority: 3,
            },
            {
                name: 'Classmates',
                baseUrl: 'https://www.classmates.com',
                buildUrl: (query, state = null) => {
                    const formatted = query.trim().replace(/\s+/g, '+');
                    return `https://www.classmates.com/siteui/search/results?q=${formatted}&searchType=people`;
                },
                enabled: true,
                priority: 3,
            },
            {
                name: 'PhoneOwner',
                baseUrl: 'https://www.phoneowner.com',
                buildUrl: (query, state = null) => {
                    const formatted = query.trim().replace(/\s+/g, '+');
                    return `https://www.phoneowner.com/po/search/name/${formatted}`;
                },
                enabled: true,
                priority: 3,
            },
            {
                name: 'ReversePhoneLookup',
                baseUrl: 'https://www.reversephonelookup.com',
                buildUrl: (query, state = null) => {
                    const formatted = query.trim().replace(/\s+/g, '-');
                    return `https://www.reversephonelookup.com/people/${formatted}`;
                },
                enabled: true,
                priority: 3,
            },
            {
                name: 'PublicDataUSA',
                baseUrl: 'https://www.publicdatausa.com',
                buildUrl: (query, state = null) => {
                    const formatted = query.trim().toLowerCase().replace(/\s+/g, '-');
                    let url = `https://www.publicdatausa.com/people/${formatted}`;
                    if (state) {
                        url += `-${state.toLowerCase()}`;
                    }
                    return url;
                },
                enabled: true,
                priority: 2,
            },
            {
                name: 'PeopleBackgroundCheck',
                baseUrl: 'https://www.peoplebackgroundcheck.com',
                buildUrl: (query, state = null) => {
                    const parts = query.trim().split(' ');
                    const firstName = parts[0] || '';
                    const lastName = parts.slice(1).join(' ') || '';
                    return `https://www.peoplebackgroundcheck.com/search?firstName=${firstName}&lastName=${lastName}`;
                },
                enabled: true,
                priority: 3,
            },
            {
                name: 'VitalRec',
                baseUrl: 'https://www.vitalrec.com',
                buildUrl: (query, state = null) => {
                    const formatted = query.trim().replace(/\s+/g, '+');
                    return `https://www.vitalrec.com/search?name=${formatted}`;
                },
                enabled: true,
                priority: 3,
            },
            {
                name: 'CyberBackgroundChecks',
                baseUrl: 'https://www.cyberbackgroundchecks.com',
                buildUrl: (query, state = null) => {
                    const formatted = query.trim().toLowerCase().replace(/\s+/g, '-');
                    let url = `https://www.cyberbackgroundchecks.com/people/${formatted}`;
                    if (state) {
                        url += `/${state.toLowerCase()}`;
                    }
                    return url;
                },
                enabled: true,
                priority: 2,
            },
        ];

        this.scanConfig = {
            maxUrlsPerScan: 40, // Maximum number of sites to scan per request
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