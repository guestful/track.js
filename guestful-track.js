(function(e,b){if(!b.__SV){var a,f,i,g;window.mixpanel=b;a=e.createElement("script");a.type="text/javascript";a.async=!0;a.src=("https:"===e.location.protocol?"https:":"http:")+'//cdn.mxpnl.com/libs/mixpanel-2.2.min.js';f=e.getElementsByTagName("script")[0];b._i=[];b.init=function(a,e,d){function f(b,h){var a=h.split(".");2==a.length&&(b=b[a[0]],h=a[1]);b[h]=function(){b.push([h].concat(Array.prototype.slice.call(arguments,0)))}}var c=b;"undefined"!==
typeof d?c=b[d]=[]:d="mixpanel";c.people=c.people||[];c.toString=function(b){var a="mixpanel";"mixpanel"!==d&&(a+="."+d);b||(a+=" (stub)");return a};c.people.toString=function(){return c.toString(1)+".people (stub)"};i="disable track track_pageview track_links track_forms register register_once alias unregister identify name_tag set_config people.set people.set_once people.increment people.append people.track_charge people.clear_charges people.delete_user".split(" ");for(g=0;g<i.length;g++)f(c,i[g]);
    b._i.push([a,e,d])};b.__SV=1.2;f.parentNode.insertBefore(a,f);}})(document,window.mixpanel||[]);

;(function ($, moment, purl) {
    "use strict";
    var
        patternDT = "YYYY-MM-DDTHH:mm:ss",
        filter = function (o) {
            var k, oo = {};
            for (k in o) {
                if (o.hasOwnProperty(k) && o[k] !== '' && o[k] !== null && o[k] !== undefined) {
                    oo[k] = o[k];
                }
            }
            return oo;
        },
        getLanguage = function (str) {
            return /([a-z]{2,3})(_[a-z]{2,3})?/.exec((str || 'en').toLowerCase())[1];
        },
        getRoles = function (user) {
            var roles = [];
            if (user.isAdmin) roles.push('Admin');
            if (user.isEditor) roles.push('Editor');
            if (user.isManager) roles.push('Manager');
            if (user.isPublisher) roles.push('Publisher');
            if (user.isStaff) roles.push('Staff');
            return roles;
        },
        getPlatform = function (str) {
            if (!str) return 'Guestful';
            switch (str) {
                case 'facebook':
                    return 'Facebook';
                case 'joomla':
                    return 'Joomla';
                case 'wordress':
                    return 'Wordpress';
                case 'wix':
                    return 'Wix';
            }
            return str.charAt(0).toUpperCase() + str.slice(1);
        },

        identify = function(opts) {
            if(opts) {
                if(opts.user && opts.user.id) {
                    mixpanel.identify(opts.user.id);
                } else if (opts.guest && opts.guest.id) {
                    mixpanel.identify(opts.guest.id);
                } else if(opts.reservation && opts.reservation.id){
                    mixpanel.identify(opts.reservation.id);
                }
            }
        },

        buildBaseTracking = function (eventOrigin, language) {
            var url = purl();
            return {
                'Event Origin': eventOrigin,
                'Website Language': language,
                'Event Hour': (new Date()).getHours(),
                'last_utm_source': url.param('utm_source') || getPlatform(url.param('origin')),
                'last_utm_campaign': url.param('utm_campaign'),
                'last_utm_content': url.param('utm_content'),
                'last_utm_term': url.param('utm_term'),
                'last_utm_medium': url.param('utm_medium')
            };
        },

        buildTracking = function (eventOrigin, language, opts) {
            opts = opts || {};
            var user = opts.user || {};
            var guest = opts.guest || {};
            var restaurant = opts.restaurant || {};
            var publisher = opts.publisher || {};
            var event = opts.event || {};
            var product = opts.product || {};
            var collection = opts.collection || {};
            var author = opts.author || (opts.collection || {}).author || {};
            var data = $.extend(
                buildBaseTracking(eventOrigin, language),
                {
                    'Authentication Platform': 'Guestful',
                    'User ID': user.id,
                    'User Name': user.name,
                    'User Email': user.email,
                    'Guestful Event ID': event.id,
                    'Guestful Event Alias': event.alias,
                    'Guestful Event Name': event.name,
                    'List ID': collection.id,
                    'List Alias': collection.alias,
                    'List Name': collection.name,
                    'Author ID': author.id,
                    'Author Alias': author.alias,
                    'Author Name': author.name,
                    'Product Title': product.title,
                    'Product Time': product.time,
                    'Product Day': product.day,
                    'Guest ID': guest.id,
                    'Guest Name': guest.name,
                    'Guest Email': guest.email,
                    'Restaurant ID': restaurant.id,
                    'Restaurant Alias': restaurant.alias,
                    'Restaurant Name': restaurant.name,
                    'Restaurant Region': (restaurant.address || {}).region,
                    'Restaurant Neighborhood': (restaurant.address || {}).neighborhood,
                    'Restaurant City': (restaurant.address || {}).city,
                    'Restaurant Country Code': (restaurant.address || {}).countryCode,
                    'Restaurant State Code': (restaurant.address || {}).stateCode,
                    'Publisher ID': publisher.id,
                    'Publisher Alias': publisher.alias,
                    'Publisher Name': publisher.name
                }
            );
            if (guest.createdDate) {
                data['Guest Creation Date'] = moment(guest.createdDate).utc().format(patternDT);
            }
            return data;
        },

        buildReservationTracking = function (reservation, eventOrigin, language, opts) {
            opts = opts || {};
            var data = buildTracking(eventOrigin, language, opts),
                now = moment(),
                restaurant =  opts.restaurant || reservation.restaurant || {},
                guest = opts.guest || {},
                start = moment(reservation.start).tz((restaurant|| {}).timeZone);
            data['Reservation Origin'] = (reservation.origin || {}).name;
            data['Reservation ID'] = reservation.id;
            data['Party Size'] = reservation.partySize;
            data['Reserved Date'] = start.clone().utc().format(patternDT);
            data['Reserved Hour'] = start.hour();
            data['Days Ahead'] = start.clone().diff(now, 'days');
            data['Hours Ahead'] = start.clone().diff(now, 'hours');
            data['Reservation Walkin'] = reservation.walkin;
            return data;
        };


    window.Guestful = $.extend(window.Guestful || {}, {
        track: {
            eventOrigin: '',

            language: 'en',

            init: function (token, opts) {
                opts = opts || {};
                this.eventOrigin = opts.eventOrigin;
                this.language = opts.language || Guestful.track.language;

                mixpanel.init(token);
            },

            viewOpened: function (viewName, opts) {
                var data = buildTracking(Guestful.track.eventOrigin, Guestful.track.language, opts);
                data['View Name'] = viewName;
                identify(opts);
                if(opts && opts.pageLocation) {
                    data['Page Location'] = opts.pageLocation;
                }
                mixpanel.track('View Opened', filter(data));
            },

            viewShared: function(viewName, service, opts) {
                var data = buildTracking(Guestful.track.eventOrigin, Guestful.track.language, opts);
                data['Service Name'] = service.service;
                data['Service Url'] = service.url;
                data['Service Title'] = service.title;
                data['View Name'] = viewName;
                identify(opts);
                mixpanel.track('View Shared', filter(data));
            },

            error: function (errorType, viewName, eventName, opts) {
                var data = buildTracking(Guestful.track.eventOrigin, Guestful.track.language, opts);
                data['View Name'] = viewName;
                data['Event Name'] = eventName;
                data['Error Type'] = errorType;
                identify(opts);
                mixpanel.track('Error', filter(data));
            },

            //Reservation
            reservationCreated: function (reservation, guest, restaurant, publisher) {
                var data = buildReservationTracking(reservation, Guestful.track.eventOrigin, Guestful.track.language, {
                    guest: guest,
                    restaurant: restaurant,
                    publisher: publisher
                });
                identify({
                    guest: guest,
                    reservation: reservation
                });

                mixpanel.track('Reservation Created', filter(data));
                mixpanel.people.set({
                    'Last Activity Date': new Date()
                });
            },

            reservationConfirmed: function (reservation, guest, restaurant, publisher) {
                var data = buildReservationTracking(reservation, Guestful.track.eventOrigin, Guestful.track.language, {
                    guest: guest,
                    restaurant: restaurant,
                    publisher: publisher
                });
                identify({
                    guest: guest,
                    reservation: reservation
                });

                mixpanel.track('Reservation Confirmed', filter(data));
                mixpanel.people.set({
                    'Last Activity Date': new Date()
                });
            },

            reservationEdited: function (reservation, guest, restaurant, publisher) {
                var data = buildReservationTracking(reservation, Guestful.track.eventOrigin, Guestful.track.language, {
                    guest: guest,
                    restaurant: restaurant,
                    publisher: publisher
                });
                identify({
                    guest: guest,
                    reservation: reservation
                });

                mixpanel.track('Reservation Edited', filter(data));
                mixpanel.people.set({
                    'Last Activity Date': new Date()
                });
            },

            reservationCanceled: function (reservation, guest, restaurant, publisher) {
                var data = buildReservationTracking(reservation, Guestful.track.eventOrigin, Guestful.track.language, {
                    guest: guest,
                    restaurant: restaurant,
                    publisher: publisher
                });
                identify({
                    guest: guest,
                    reservation: reservation
                });

                mixpanel.track('Reservation Canceled', filter(data));
                mixpanel.people.increment('Cancelation Count');
                mixpanel.people.set({
                    'Last Activity Date': new Date()
                });
            },

            reservationCompleted: function (reservation, guest, restaurant, publisher) {
                var data = buildReservationTracking(reservation, Guestful.track.eventOrigin, Guestful.track.language, {
                    guest: guest,
                    restaurant: restaurant,
                    publisher: publisher
                });
                identify({
                    guest: guest,
                    reservation: reservation
                });

                mixpanel.track('Reservation Completed', filter(data));
                mixpanel.people.set({
                    'Last Activity Date': new Date()
                });
            },

            reservationNoShow: function (reservation, guest, restaurant, publisher) {
                var data = buildReservationTracking(reservation, Guestful.track.eventOrigin, Guestful.track.language, {
                    guest: guest,
                    restaurant: restaurant,
                    publisher: publisher
                });
                identify({
                    guest: guest,
                    reservation: reservation
                });

                mixpanel.people.increment('NoShow Count');
                mixpanel.track('Reservation NoShow', filter(data));
                mixpanel.people.set({
                    'Last Activity Date': new Date()
                });
            },


            reservationReviewed: function (scale, reservation, guest, restaurant, publisher, callback) {
                var data = buildReservationTracking(reservation, Guestful.track.eventOrigin, Guestful.track.language, {
                    guest: guest,
                    restaurant : restaurant,
                    publisher: publisher
                });

                data['Liked'] = scale >= 0.5;
                identify({
                    guest: guest,
                    reservation: reservation
                });

                mixpanel.people.set({
                    'Last Activity Date': new Date(),
                    'Last Review Date': new Date()
                });
                mixpanel.people.increment('Reviewed Count');
                mixpanel.people.append({
                    'Reviewed Restaurant IDS': restaurant.id,
                    'Reviewed Restaurant Aliases': restaurant.alias,
                    'Reviewed Restaurant Names': restaurant.name
                });
                mixpanel.track('Reservation Reviewed', filter(data), callback || $.noop);
                mixpanel.people.set({
                    'Last Activity Date': new Date()
                });
            },

            //Guest
            guestLogin: function (guest, restaurant, publisher, callback) {
                identify({
                    guest: guest
                });

                mixpanel.people.set(filter({
                    '$first_name': guest.firstName,
                    '$last_name': guest.lastName,
                    '$name': guest.name,
                    '$phone': guest.phoneNumber,
                    '$email': guest.email,
                    '$created': new Date(guest.createdDate),
                    'Facebook ID': guest.facebookId,
                    'Gender': guest.gender,
                    'Last Authentication Date': new Date(),
                    'Last Authentication Platform': guest.facebookAuth ? 'Facebook' : 'Guestful',
                    'Language': getLanguage(guest.locale),
                    'Time Zone': guest.timeZone,
                    'Roles': ['Guest'],
                    'Last Restaurant Region': (restaurant.address || {}).region,
                    'Last Restaurant Neighborhood': (restaurant.address || {}).neighborhood,
                    'Last Restaurant City': (restaurant.address || {}).city,
                    'Last Restaurant Country Code': (restaurant.address || {}).countryCode,
                    'Last Restaurant State Code': (restaurant.address || {}).stateCode
                }), function () {
                    mixpanel.people.set_once(filter({
                        'First Authentication Date': new Date(),
                        'First Authentication Platform': guest.facebookAuth ? 'Facebook' : 'Guestful'
                    }));
                    (callback || $.noop)();
                });
                mixpanel.track('Guest Login', filter(buildTracking(Guestful.track.eventOrigin, Guestful.track.language, {
                    guest: guest,
                    restaurant: restaurant,
                    publisher: publisher
                })));
            },

            guestSubscribed : function(guest, restaurant, pageLocation) {
                var data = buildTracking(Guestful.track.eventOrigin, Guestful.track.language, {guest: guest, restaurant: restaurant});
                data['Guest Language'] = guest.lang;
                data['Page Location'] = pageLocation;
                identify({
                    guest: guest
                });
                mixpanel.track('Guest Opt-In', filter(data));
            },

            //Event
            eventBooked: function(event, product, restaurant) {
                mixpanel.track('Event Booking', filter(buildTracking(Guestful.track.eventOrigin, Guestful.track.language, {
                    event: event,
                    restaurant : restaurant,
                    product: product
                })));
            },

            eventBack: function(event, product, restaurant) {
                mixpanel.track('Event Booking Back', filter(buildTracking(Guestful.track.eventOrigin, Guestful.track.language, {
                    event: event,
                    restaurant: restaurant,
                    product: product
                })));
            },

            eventMore: function(event, product, restaurant) {
                mixpanel.track('Event Loading More', filter(buildTracking(Guestful.track.eventOrigin, Guestful.track.language, {
                    event: event,
                    restaurant: restaurant,
                    product: product
                })));
            },

            eventCheckoutStarted: function(event, product, restaurant) {
                mixpanel.track('Checkout Started', filter(buildTracking(Guestful.track.eventOrigin, Guestful.track.language, {
                    event: event,
                    restaurant: restaurant,
                    product: product
                })));
            },

            //Portal
            installedWidget : function(user, restaurant, platform, eventOrigin) {
                var data = buildTracking(Guestful.track.eventOrigin, Guestful.track.language, {
                    user: user,
                    restaurant: restaurant
                });
                if(eventOrigin) {
                    data['Event Origin'] = eventOrigin;
                }
                data['Platform'] = platform;
                identify({
                    user: user
                });
                mixpanel.track('Widget Installed', filter(data));
            },

            contactAdded: function (user, callback) {
                var data = buildTracking(Guestful.track.eventOrigin, Guestful.track.language, {user: user});
                identify({
                    user: user
                });
                mixpanel.track('Contact Added', filter(data), callback);
            },

            contactEdited: function (user, callback) {
                var data = buildTracking(Guestful.track.eventOrigin, Guestful.track.language, {user: user});
                identify({
                    user: user
                });
                mixpanel.track('Contact Edited', filter(data), callback);
            },

            contactRemoved: function (user, callback) {
                var data = buildTracking(Guestful.track.eventOrigin, Guestful.track.language, {user: user});
                identify({
                    user: user
                });
                mixpanel.track('Contact Removed', filter(data), callback);
            },

            serviceAdded: function (user, service, callback) {
                var data = buildTracking(Guestful.track.eventOrigin, Guestful.track.language, {user: user});
                data['Days'] = service.recurrence.daysOfWeek;
                identify({
                    user: user
                });
                mixpanel.track('Service Added', filter(data), callback);
            },

            serviceEdited: function (user, service, callback) {
                var data = buildTracking(Guestful.track.eventOrigin, Guestful.track.language, {user: user});
                data['Days'] = service.recurrence.daysOfWeek;
                identify({
                    user: user
                });
                mixpanel.track('Service Edited', filter(data), callback);
            },

            serviceRemoved: function (user, callback) {
                var data = buildTracking(Guestful.track.eventOrigin, Guestful.track.language, {user: user});
                identify({
                    user: user
                });
                mixpanel.track('Service Removed', filter(data), callback);
            },

            noteAdded: function (user, note, callback) {
                var data = buildTracking(Guestful.track.eventOrigin, Guestful.track.language, {user: user});
                data['Days'] = note.recurrence.daysOfWeek;
                identify({
                    user: user
                });
                mixpanel.track('Note Added', filter(data), callback);
            },

            noteEdited: function (user, note, callback) {
                var data = buildTracking(Guestful.track.eventOrigin, Guestful.track.language, {user: user});
                data['Days'] = note.recurrence.daysOfWeek;
                identify({
                    user: user
                });
                mixpanel.track('Note Edited', filter(data), callback);
            },

            noteRemoved: function (user, callback) {
                var data = buildTracking(Guestful.track.eventOrigin, Guestful.track.language, {user: user});
                identify({
                    user: user
                });
                mixpanel.track('Note Removed', filter(data), callback);
            },

            //Restaurant
            restaurantCreated: function (user, restaurant, callback) {
                identify({
                    user: user
                });
                mixpanel.people.set(filter({
                    'Roles': getRoles(user),
                    'Staffed Restaurant Aliases': $.map(user.restaurants || [], function (r) {
                        return r.alias;
                    }),
                    'Staffed Restaurant IDS': $.map(user.restaurants || [], function (r) {
                        return r.id;
                    }),
                    'Staffed Restaurant Names': $.map(user.restaurants || [], function (r) {
                        return r.name;
                    }),
                    'Managed Restaurant Aliases': $.map(user.managedRestaurants || [], function (r) {
                        return r.alias;
                    }),
                    'Managed Restaurant IDS': $.map(user.managedRestaurants || [], function (r) {
                        return r.id;
                    }),
                    'Managed Restaurant Names': $.map(user.managedRestaurants || [], function (r) {
                        return r.name;
                    })
                }), function() {
                    mixpanel.track('Restaurant Created', filter(buildTracking(Guestful.track.eventOrigin, Guestful.track.language, {
                        user: user,
                        restaurant: restaurant
                    })), callback);
                });
            },

            restaurantEdited: function (user, restaurant, callback) {
                var data = buildTracking(Guestful.track.eventOrigin, Guestful.track.language, {user: user, restaurant: restaurant});
                identify({
                    user: user
                });
                mixpanel.track('Restaurant Edited', filter(data), callback);
            },

            //User
            passwordResetRequested: function (email) {
                var data = buildTracking(Guestful.track.eventOrigin, Guestful.track.language);
                data['User Email'] = email;
                mixpanel.track('Password Reset Requested', filter(data));
            },

            userLoaded: function(user) {
                identify({
                    user: user
                });
                mixpanel.people.set(filter({
                    '$first_name': user.firstName,
                    '$last_name': user.lastName,
                    '$name': user.name,
                    '$phone': user.phoneNumber,
                    '$email': user.email,
                    '$created': new Date(user.createdDate),
                    'Gender': user.gender,
                    'Last Authentication Date': new Date(),
                    'Last Authentication Platform': 'Guestful',
                    'Language': getLanguage(user.locale),
                    'Roles': getRoles(user),
                    'Staffed Restaurant Aliases': $.map(user.restaurants || [], function (r) {
                        return r.alias;
                    }),
                    'Staffed Restaurant IDS': $.map(user.restaurants || [], function (r) {
                        return r.id;
                    }),
                    'Staffed Restaurant Names': $.map(user.restaurants || [], function (r) {
                        return r.name;
                    }),
                    'Managed Restaurant Aliases': $.map(user.managedRestaurants || [], function (r) {
                        return r.alias;
                    }),
                    'Managed Restaurant IDS': $.map(user.managedRestaurants || [], function (r) {
                        return r.id;
                    }),
                    'Managed Restaurant Names': $.map(user.managedRestaurants || [], function (r) {
                        return r.name;
                    }),
                    'Time Zone': user.timeZone
                }));
            },

            userLogged: function (user, cb) {
                identify({
                    user: user
                });
                mixpanel.people.set(filter({
                    '$first_name': user.firstName,
                    '$last_name': user.lastName,
                    '$name': user.name,
                    '$phone': user.phoneNumber,
                    '$email': user.email,
                    '$created': new Date(user.createdDate),
                    'Gender': user.gender,
                    'Last Authentication Platform': 'Guestful',
                    'Last Authentication Date': new Date(),
                    'Language': getLanguage(user.locale),
                    'Roles': getRoles(user),
                    'Staffed Restaurant Aliases': $.map(user.restaurants || [], function (r) {
                        return r.alias;
                    }),
                    'Staffed Restaurant IDS': $.map(user.restaurants || [], function (r) {
                        return r.id;
                    }),
                    'Staffed Restaurant Names': $.map(user.restaurants || [], function (r) {
                        return r.name;
                    }),
                    'Managed Restaurant Aliases': $.map(user.managedRestaurants || [], function (r) {
                        return r.alias;
                    }),
                    'Managed Restaurant IDS': $.map(user.managedRestaurants || [], function (r) {
                        return r.id;
                    }),
                    'Managed Restaurant Names': $.map(user.managedRestaurants || [], function (r) {
                        return r.name;
                    }),
                    'Time Zone': user.timeZone
                }), function () {
                    mixpanel.people.set_once(filter({
                        'First Authentication Date': new Date(),
                        'First Authentication Platform': 'Guestful'
                    }));
                    var data = buildTracking(Guestful.track.eventOrigin, Guestful.track.language, {user: user});
                    mixpanel.track('User Login', filter(data), cb || $.noop);
                });
            },

            userRegistered: function (user) {
                // just identify the user for following events
                identify({
                    user: user
                });
                mixpanel.people.set(filter({
                    '$first_name': user.firstName,
                    '$last_name': user.lastName,
                    '$name': user.name,
                    '$phone': user.phoneNumber,
                    '$email': user.email,
                    '$created': new Date(user.createdDate),
                    'Last Authentication Platform': 'Guestful',
                    'Last Authentication Date': new Date(),
                    'Gender': user.gender,
                    'Language': getLanguage(user.locale),
                    'Time Zone': user.timeZone,
                    'Roles': getRoles(user),
                    'Staffed Restaurant Aliases': $.map(user.restaurants || [], function (r) {
                        return r.alias;
                    }),
                    'Staffed Restaurant IDS': $.map(user.restaurants || [], function (r) {
                        return r.id;
                    }),
                    'Staffed Restaurant Names': $.map(user.restaurants || [], function (r) {
                        return r.name;
                    }),
                    'Managed Restaurant Aliases': $.map(user.managedRestaurants || [], function (r) {
                        return r.alias;
                    }),
                    'Managed Restaurant IDS': $.map(user.managedRestaurants || [], function (r) {
                        return r.id;
                    }),
                    'Managed Restaurant Names': $.map(user.managedRestaurants || [], function (r) {
                        return r.name;
                    })
                }));
                var data = buildTracking(Guestful.track.eventOrigin, Guestful.track.language, {user : user});
                mixpanel.track('User Registered', filter(data));
            },

            userEdited: function (user, cb) {
                identify({
                    user: user
                });
                mixpanel.people.set(filter({
                    '$first_name': user.firstName,
                    '$last_name': user.lastName,
                    '$name': user.name,
                    '$phone': user.phoneNumber,
                    '$email': user.email,
                    '$created': new Date(user.createdDate),
                    'Facebook ID': user.facebookId,
                    'Gender': user.gender,
                    'Language': getLanguage(user.locale),
                    'Roles': getRoles(user),
                    'Staffed Restaurant Aliases': $.map(user.restaurants || [], function (r) {
                        return r.alias;
                    }),
                    'Staffed Restaurant IDS': $.map(user.restaurants || [], function (r) {
                        return r.id;
                    }),
                    'Staffed Restaurant Names': $.map(user.restaurants || [], function (r) {
                        return r.name;
                    }),
                    'Managed Restaurant Aliases': $.map(user.managedRestaurants || [], function (r) {
                        return r.alias;
                    }),
                    'Managed Restaurant IDS': $.map(user.managedRestaurants || [], function (r) {
                        return r.id;
                    }),
                    'Managed Restaurant Names': $.map(user.managedRestaurants || [], function (r) {
                        return r.name;
                    }),
                    'Time Zone': user.timeZone
                }), function() {
                    var data = buildTracking(Guestful.track.eventOrigin, Guestful.track.language, {user: user});
                    mixpanel.track('User Edited', filter(data), cb || $.noop);
                });
            },

            //Misc
            searchTerm : function(data, val, url, cb) {
                data = data || {};
                var obj = {
                    author: {
                        'Author ID': data.id,
                        'Author Alias': data.alias,
                        'Author Name': data.name
                    },
                    restaurant: {
                        'Restaurant ID': data.id,
                        'Restaurant Alias': data.alias,
                        'Restaurant Name': data.name
                    },
                    collection: {
                        'List ID': data.id,
                        'List Alias': data.alias,
                        'List Name': data.name
                    }
                };
                mixpanel.track('Search', filter(
                    $.extend(
                        {
                            'No Result': !data.name,
                            'Term': val
                        },
                        buildBaseTracking(Guestful.track.eventOrigin, Guestful.track.language),
                        obj[data.type] || {}
                    ), cb || $.noop));
            },

            searchNotFound : function(cb) {
                var data = buildBaseTracking(Guestful.track.eventOrigin, Guestful.track.language);
                data['No Result'] = true;
                mixpanel.track('Search', filter(data), cb || $.noop);
            },

            voted : function(guest, platform) {
                var data = buildTracking(Guestful.track.eventOrigin, Guestful.track.language, {guest: guest});
                data['Platform'] = platform;
                mixpanel.track('Vote', filter(data));
            },

            links : function(selector, event) {
                mixpanel.track_links(selector, event, function(anchor) {
                    var data = buildBaseTracking(Guestful.track.eventOrigin, Guestful.track.language);
                    data['Link'] = anchor.href;
                    data['Location'] = document.location.href;
                    data['Website Language'] = Guestful.track.language;
                    return filter(data);
                });
            }
        }
    });
}(jQuery, moment, purl));