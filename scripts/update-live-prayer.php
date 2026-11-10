<?php
/** Run the same resolver as WordPress for the static proposal. No credential is persisted. */
if ( PHP_SAPI !== 'cli' ) { exit(1); }
$root = dirname(__DIR__);
$state_path = getenv('FR_LIVE_STATE_PATH') ?: $root . '/.live-state/state.json';
$check = in_array('--check', $argv, true);
$state = is_file($state_path) ? json_decode(file_get_contents($state_path), true) : array();
$GLOBALS['fr_cli_options'] = is_array($state) ? $state : array();
define('ABSPATH', $root . '/');
function get_option($name, $default = false) { return $GLOBALS['fr_cli_options'][$name] ?? $default; }
function update_option($name, $value, $autoload = false) { $GLOBALS['fr_cli_options'][$name] = $value; return true; }
function add_option($name, $value, $deprecated = '', $autoload = false) { if (isset($GLOBALS['fr_cli_options'][$name])) return false; return update_option($name, $value); }
function get_transient($name) { $v = get_option('transient_' . $name); return is_array($v) && $v['until'] > time() ? $v['data'] : false; }
function set_transient($name, $data, $ttl) { return update_option('transient_' . $name, array('until' => time()+$ttl, 'data' => $data)); }
function wp_cache_delete($key, $group) {}
function wp_generate_uuid4() { return bin2hex(random_bytes(16)); }
function add_action($hook, $handler) {}
function is_wp_error($value) { return $value === false; }
function wp_remote_retrieve_response_code($value) { return $value['status']; }
function wp_remote_retrieve_body($value) { return $value['body']; }
class FR_CLI_Options {
 public $options = 'options';
 public function delete($table, $where, $format) {
  if (get_option($where['option_name']) === $where['option_value']) unset($GLOBALS['fr_cli_options'][$where['option_name']]);
 }
}
$GLOBALS['wpdb'] = new FR_CLI_Options();
function wp_remote_get($url, $options) {
 // The shared resolver supplies the fixed Google endpoint and a private header.
 $handle = curl_init($url);
 curl_setopt_array($handle, array(CURLOPT_RETURNTRANSFER => true, CURLOPT_FOLLOWLOCATION => false, CURLOPT_CONNECTTIMEOUT => 3, CURLOPT_TIMEOUT => $options['timeout'], CURLOPT_SSL_VERIFYPEER => true, CURLOPT_SSL_VERIFYHOST => 2, CURLOPT_HTTPHEADER => array('X-Goog-Api-Key: ' . $options['headers']['X-Goog-Api-Key'], 'Accept: application/json')));
 $body = curl_exec($handle);$status = curl_getinfo($handle, CURLINFO_HTTP_CODE);curl_close($handle);
 if ($body === false || strlen($body) > $options['limit_response_size']) return false;
 return array('status' => $status, 'body' => $body);
}
require $root . '/wordpress/family-rosary/inc/live-prayer.php';
if (family_rosary_live_key() === '') { fwrite(STDERR, "Automatic prayer source needs its one-time private YouTube API key connection.\n"); exit(2); }
$payload = family_rosary_live_resolve();
// Save public candidate/cache/quota metadata only, including failed-attempt budget.
if (!is_dir(dirname($state_path))) mkdir(dirname($state_path), 0700, true);
file_put_contents($state_path, json_encode($GLOBALS['fr_cli_options'], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
if (($payload['discovery']['status'] ?? '') !== 'ok') { fwrite(STDERR, "YouTube discovery unavailable; previous published metadata will expire safely.\n"); exit(3); }
// Scheduled proposal updates allow bounded delivery lag; native WordPress retains its 60-second TTL.
$now = time();
$midnight = (new DateTimeImmutable('@' . $now))->setTimezone(new DateTimeZone('America/New_York'))->modify('tomorrow')->setTime(0, 0)->getTimestamp();
$payload['expires_at'] = gmdate('c', min($now+1200, $midnight));
$payload['discovery']['delivery'] = 'scheduled-proposal';
if (!$check) {
 $target = $root . '/docs/live/prayer.json';
 if (!is_dir(dirname($target))) mkdir(dirname($target), 0755, true);
 file_put_contents($target, json_encode($payload, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES) . "\n");
}
echo 'Verified automatic source: ' . count($payload['programs']) . ' current-day live/upcoming prayer program(s).' . "\n";
