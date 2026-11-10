<?php
/** Public broadcast metadata, resolved only through the official YouTube Data API. */
if ( ! defined( 'ABSPATH' ) ) { exit; }

function family_rosary_live_channel() { return 'UCpIopQGMftbQufHMjcH6Mwg'; }
function family_rosary_live_key() {
 $key = defined( 'FR_YOUTUBE_API_KEY' ) ? FR_YOUTUBE_API_KEY : getenv( 'FR_YOUTUBE_API_KEY' );
 return is_string( $key ) ? trim( $key ) : '';
}
function family_rosary_live_day( $timestamp, $zone = 'America/New_York' ) {
 return ( new DateTimeImmutable( '@' . $timestamp ) )->setTimezone( new DateTimeZone( $zone ) )->format( 'Y-m-d' );
}
function family_rosary_live_timestamp( $value ) {
 if ( ! is_string( $value ) || ! preg_match( '/^\d{4}-\d{2}-\d{2}T/', $value ) ) { return false; }
 try { return ( new DateTimeImmutable( $value ) )->getTimestamp(); } catch ( Exception $e ) { return false; }
}
function family_rosary_live_payload( $now, $status, $programs = array() ) {
 $midnight = ( new DateTimeImmutable( '@' . $now ) )->setTimezone( new DateTimeZone( 'America/New_York' ) )->modify( 'tomorrow' )->setTime( 0, 0 )->getTimestamp();
 return array( 'version' => 2, 'channel' => family_rosary_live_channel(), 'generated_at' => gmdate( 'c', $now ), 'expires_at' => gmdate( 'c', min( $now + 60, $midnight ) ), 'programs' => array_values( $programs ), 'discovery' => array( 'mode' => 'automatic', 'status' => $status ) );
}
/** No URL supplied by a visitor, no key in query strings, and no provider error text returned. */
function family_rosary_live_api( $resource, $params, $key ) {
 if ( ! in_array( $resource, array( 'search', 'videos' ), true ) ) { return false; }
 $url = 'https://www.googleapis.com/youtube/v3/' . $resource . '?' . http_build_query( $params, '', '&', PHP_QUERY_RFC3986 );
 $response = wp_remote_get( $url, array( 'timeout' => 5, 'redirection' => 0, 'sslverify' => true, 'limit_response_size' => 131072, 'headers' => array( 'X-Goog-Api-Key' => $key, 'Accept' => 'application/json' ) ) );
 if ( is_wp_error( $response ) || wp_remote_retrieve_response_code( $response ) !== 200 ) { return false; }
 $data = json_decode( wp_remote_retrieve_body( $response ), true );
 return is_array( $data ) && isset( $data['items'] ) && is_array( $data['items'] ) ? $data['items'] : false;
}
/** Caller holds the discovery lock. Count failed attempts too; reset on Pacific calendar date. */
function family_rosary_live_search_budget( $now ) {
 $day = family_rosary_live_day( $now, 'America/Los_Angeles' );
 $budget = get_option( 'fr_live_search_budget', array() );
 if ( ! is_array( $budget ) || ( $budget['day'] ?? '' ) !== $day ) { $budget = array( 'day' => $day, 'count' => 0 ); }
 $budget['count'] = max( 0, (int) ( $budget['count'] ?? 0 ) );
 if ( $budget['count'] >= 90 ) { return false; }
 $budget['count']++;update_option( 'fr_live_search_budget', $budget, false );return true;
}
/** Atomic unique option creation prevents parallel requests from spending duplicate discovery quota. */
function family_rosary_live_lock( $now ) {
 $name = 'fr_live_discovery_lock';$old = get_option( $name, false );
 if ( $old !== false && (int) $old <= $now ) {
  global $wpdb;
  // Compare-and-delete cannot remove a newer lock acquired by another request.
  $wpdb->delete( $wpdb->options, array( 'option_name' => $name, 'option_value' => (string) $old ), array( '%s', '%s' ) );
  wp_cache_delete( $name, 'options' );
 }
 $token = ( $now + 30 ) . ':' . wp_generate_uuid4();
 return add_option( $name, $token, '', false ) ? $token : false;
}
function family_rosary_live_unlock( $token ) {
 global $wpdb;
 $wpdb->delete( $wpdb->options, array( 'option_name' => 'fr_live_discovery_lock', 'option_value' => $token ), array( '%s', '%s' ) );
 wp_cache_delete( 'fr_live_discovery_lock', 'options' );
}
/** Return only current-day public, embeddable, source-confirmed live/upcoming prayer programs. */
function family_rosary_live_programs( $items, $now ) {
 $programs = array();$today = family_rosary_live_day( $now );
 foreach ( $items as $item ) {
  $id = $item['id'] ?? '';$snippet = $item['snippet'] ?? array();$status = $item['status'] ?? array();$details = $item['liveStreamingDetails'] ?? array();
  if ( ! preg_match( '/^[\w-]{11}$/', $id ) || ( $snippet['channelId'] ?? '' ) !== family_rosary_live_channel() || ( $status['privacyStatus'] ?? '' ) !== 'public' || ( $status['embeddable'] ?? false ) !== true ) { continue; }
  $title = html_entity_decode( strip_tags( $snippet['title'] ?? '' ), ENT_QUOTES, 'UTF-8' );
  if ( ! preg_match( '/^(?:the\s+)?(?:(?:holy|daily)\s+)?(?:rosary|mass|eucharist)(?:\s*(?:[|:\-–—]|$)|\s+(?:and|&)\s+(?:(?:holy|daily)\s+)?(?:rosary|mass|eucharist)(?:\s*(?:[|:\-–—]|$)))/iu', $title ) ) { continue; }
  $rosary = preg_match( '/\brosary\b/i', $title );$mass = preg_match( '/\b(mass|eucharist)\b/i', $title );
  if ( ! $rosary && ! $mass ) { continue; }
  $start = family_rosary_live_timestamp( $details['actualStartTime'] ?? null );$end = family_rosary_live_timestamp( $details['actualEndTime'] ?? null );$scheduled = family_rosary_live_timestamp( $details['scheduledStartTime'] ?? null );
  if ( $end !== false || isset( $details['actualEndTime'] ) || ( $start !== false && ( $start > $now || family_rosary_live_day( $start ) !== $today ) ) || ( $scheduled !== false && family_rosary_live_day( $scheduled ) !== $today ) ) { continue; }
  $broadcast = $snippet['liveBroadcastContent'] ?? '';
  if ( $broadcast === 'live' && $start !== false ) { $state = 'live'; }
  elseif ( $broadcast === 'upcoming' && $start === false && $scheduled !== false ) { $state = 'upcoming'; }
  else { continue; }
  $programs[] = array( 'video_id' => $id, 'title' => $title, 'kind' => $rosary && $mass ? 'combined' : ( $rosary ? 'rosary' : 'mass' ), 'state' => $state, 'scheduled_start' => $scheduled === false ? null : gmdate( 'c', $scheduled ), 'actual_start' => $start === false ? null : gmdate( 'c', $start ), 'actual_end' => null );
 }
 return $programs;
}
function family_rosary_live_resolve( $now = null ) {
 $now = $now ?? time();$key = family_rosary_live_key();
 if ( $key === '' ) { return family_rosary_live_payload( $now, 'unconfigured' ); }
 $cached = get_transient( 'fr_live_verified_response' );
 $generated = is_array( $cached ) ? family_rosary_live_timestamp( $cached['generated_at'] ?? null ) : false;
 if ( $generated !== false && $generated <= $now && family_rosary_live_day( $generated ) === family_rosary_live_day( $now ) && family_rosary_live_timestamp( $cached['expires_at'] ?? null ) > $now ) { return $cached; }
 $lock = family_rosary_live_lock( $now );
 if ( ! $lock ) { return family_rosary_live_payload( $now, 'unavailable' ); }
 try {
  $state = get_option( 'fr_live_discovery_state', array() );if ( ! is_array( $state ) ) { $state = array(); }
  $eastern = ( new DateTimeImmutable( '@' . $now ) )->setTimezone( new DateTimeZone( 'America/New_York' ) );
  $minute = (int) $eastern->format( 'G' ) * 60 + (int) $eastern->format( 'i' );
  $active = (int) $eastern->format( 'N' ) <= 5 && $minute >= 630 && $minute <= 810;
  if ( ! empty( $state['actual_live'] ) ) { $active = true; }
  $intervals = array( 'live' => $active ? 300 : 3600, 'upcoming' => 7200 );
  $search_failed = false;
  foreach ( $intervals as $event => $interval ) {
   if ( $now - (int) ( $state[$event . '_checked'] ?? 0 ) < $interval ) { continue; }
   // Stamp before requests so a provider outage cannot provoke repeated searches.
   $state[$event . '_checked'] = $now;update_option( 'fr_live_discovery_state', $state, false );
   if ( ! family_rosary_live_search_budget( $now ) ) { $search_failed = true;continue; }
   $found = family_rosary_live_api( 'search', array( 'part' => 'snippet', 'channelId' => family_rosary_live_channel(), 'eventType' => $event, 'type' => 'video', 'maxResults' => 50, 'fields' => 'items(id/videoId)' ), $key );
   if ( $found === false ) { $search_failed = true; }
   if ( $found !== false ) { $state[$event . '_ids'] = array_values( array_filter( array_map( function( $item ) { return $item['id']['videoId'] ?? ''; }, $found ), function( $id ) { return preg_match( '/^[\w-]{11}$/', $id ); } ) ); }
  }
  $ids = array_values( array_unique( array_merge( $state['live_ids'] ?? array(), $state['upcoming_ids'] ?? array() ) ) );
  $ids = array_slice( array_values( array_filter( $ids, function( $id ) { return is_string( $id ) && preg_match( '/^[\w-]{11}$/', $id ); } ) ), 0, 100 );
  $items = array();
  foreach ( array_chunk( $ids, 50 ) as $batch ) {
   $verified = family_rosary_live_api( 'videos', array( 'part' => 'snippet,status,liveStreamingDetails', 'id' => implode( ',', $batch ), 'fields' => 'items(id,snippet(channelId,title,liveBroadcastContent),status(privacyStatus,embeddable),liveStreamingDetails(scheduledStartTime,actualStartTime,actualEndTime))' ), $key );
   if ( $verified === false ) { $items = false;break; }
   $items = array_merge( $items, $verified );
  }
  $programs = $items === false ? array() : family_rosary_live_programs( $items, $now );
  $state['actual_live'] = count( array_filter( $programs, function( $p ) { return $p['state'] === 'live'; } ) ) > 0;
  update_option( 'fr_live_discovery_state', $state, false );
  $payload = family_rosary_live_payload( $now, $items === false || ( $search_failed && ! $programs ) ? 'unavailable' : 'ok', $programs );set_transient( 'fr_live_verified_response', $payload, 60 );return $payload;
 } finally { family_rosary_live_unlock( $lock ); }
}
function family_rosary_live_rest() {
 $response = new WP_REST_Response( family_rosary_live_resolve(), 200 );$response->header( 'Cache-Control', 'public, max-age=30' );return $response;
}
add_action( 'rest_api_init', function() {
 register_rest_route( 'family-rosary/v1', '/live', array( 'methods' => 'GET', 'callback' => 'family_rosary_live_rest', 'permission_callback' => '__return_true' ) );
} );
